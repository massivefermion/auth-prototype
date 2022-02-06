'use strict'
import { Ability } from '@casl/ability'
import { argon2id, hash, verify } from 'argon2'
import { jwtVerify, SignJWT } from 'jose'
import { ServiceSchema } from 'moleculer'
import { createConnection } from 'typeorm'
import { Access } from './entity/Access'
import { Action } from './entity/Action'
import { Role } from './entity/Role'
import { User } from './entity/User'
import { Subject } from './entity/Subject'
import { map } from 'bluebird'

const Service: ServiceSchema = {
  connection: null,
  name: 'auth',

  actions: {
    checkAbility: {
      params: {
        token: 'string',
        abilities: {
          type: 'array',
          items: {
            type: 'object',
            props: { action: 'string', subject: 'string' },
          },
        },
      },
      async handler(ctx) {
        const {
          params: { token, abilities },
        } = ctx

        const payload = await this.verifyToken(token)
        if (!payload) return false

        const { id: userId } = payload
        const rules = await this.createRulesForUser(userId)
        return {
          userId,
          allowed: abilities.every(a => rules.can(a.action, a.subject)),
        }
      },
    },

    register: {
      params: {
        username: 'string',
        password: 'string',
        roles: { type: 'array', items: 'number', optional: true },
        accesses: { type: 'array', items: 'number', optional: true },
      },
      async handler({ params: { username, password, roles, accesses } }) {
        const newUser = await this.registerUser(
          username,
          password,
          roles,
          accesses
        )

        if (newUser) return { userId: newUser.id }
        return null
      },
    },

    login: {
      params: { username: 'string', password: 'string' },
      async handler({ params: { username, password } }) {
        const verifiedUser = await this.verifyUser(username, password)
        if (verifiedUser) {
          return {
            token: await this.signToken({
              id: verifiedUser.id,
              username: verifiedUser.username,
            }),
          }
        }
        return null
      },
    },
  },

  methods: {
    async createRulesForUser(id: number): Promise<Ability> {
      const user = await User.findOne(id, {
        relations: [
          'accesses',
          'accesses.action',
          'accesses.subject',
          'roles',
          'roles.accesses',
          'roles.accesses.action',
          'roles.accesses.subject',
        ],
      })

      const accesses = [
        ...user.accesses,
        ...(user.roles.length > 0
          ? user.roles.map(r => r.accesses).flat()
          : []),
      ]

      return new Ability(
        accesses.map(a => ({
          action: a.action.name,
          subject: a.subject.name,
        }))
      )
    },

    async signToken(payload: any): Promise<string> {
      const jwt = await new SignJWT(payload)
      jwt.setProtectedHeader({ alg: 'HS256' })
      return jwt.sign(Buffer.from('secret'))
    },

    async verifyToken(token: string): Promise<any> {
      try {
        const {
          payload,
          protectedHeader: { alg },
        } = await jwtVerify(token, Buffer.from('secret'))
        if (alg != 'HS256') return null
        return payload
      } catch {
        return null
      }
    },

    async registerUser(
      username: string,
      password: string,
      roles?: number[],
      accesses?: number[]
    ): Promise<User> {
      let foundAccesses = []
      let foundRoles = []

      if (roles && roles.length > 0) {
        foundRoles = await Role.find({
          where: roles.map(r => ({
            id: r,
          })),
        })

        if (foundRoles.length < roles.length) {
          return null
        }
      }

      if (accesses && accesses.length > 0) {
        foundAccesses = await Access.find({
          where: accesses.map(a => ({ id: a })),
        })

        if (foundAccesses.length < accesses.length) {
          return null
        }
      }

      const hashedPassword = await hash(password, { type: argon2id })
      const newUser = new User()
      newUser.username = username
      newUser.password = hashedPassword
      newUser.accesses = foundAccesses
      newUser.roles = foundRoles
      await newUser.save()
      return newUser
    },

    async verifyUser(username: string, password: string): Promise<User> {
      const user = await User.findOne({ username })
      if (user && (await verify(user.password, password, { type: argon2id }))) {
        return user
      }
      return null
    },
  },

  async started() {
    this.connection = await createConnection()

    if ((await Action.count()) == 0) {
      const read = new Action()
      read.id = 1
      read.name = 'read'
      await read.save()

      if ((await Subject.count()) == 0) {
        const book = new Subject()
        book.id = 1
        book.name = 'book'
        await book.save()

        const magazine = new Subject()
        magazine.id = 2
        magazine.name = 'magazine'
        await magazine.save()

        const report = new Subject()
        report.id = 3
        report.name = 'report'
        await report.save()

        if ((await Access.count()) == 0) {
          const readBook = new Access()
          readBook.id = 1
          readBook.name = 'read book'
          readBook.action = read
          readBook.subject = book
          await readBook.save()

          const readMagazine = new Access()
          readMagazine.id = 2
          readMagazine.name = 'read magazine'
          readMagazine.action = read
          readMagazine.subject = magazine
          await readMagazine.save()

          const readReport = new Access()
          readReport.id = 3
          readReport.name = 'read report'
          readReport.action = read
          readReport.subject = report
          await readReport.save()

          if ((await Role.count()) == 0) {
            const employee = new Role()
            employee.id = 1
            employee.name = 'employee'
            employee.accesses = [readReport]
            await employee.save()

            if ((await User.count()) == 0) {
              const bookReader = await this.registerUser(
                'bookReader',
                '12345',
                [],
                [readBook.id]
              )

              const magazineReader = await this.registerUser(
                'magazineReader',
                '12345',
                [],
                [readMagazine.id]
              )

              const reportReader = await this.registerUser(
                'reportReader',
                '12345',
                [employee.id]
              )

              console.dir(
                [bookReader, magazineReader, reportReader].map(u => {
                  u.plainPassword = '12345'
                  return u
                }),
                {
                  depth: null,
                }
              )
            }
          }
        }
      }
    }
  },

  async stopped() {
    await this.connection.close()
  },
}

export = Service
