import { compose, Middleware, Callback } from './index'
import { expect } from 'chai'

describe('compose middleware', () => {
  it('should compose middleware', (done) => {
    const middleware = compose([
      function (req: any, res: any, next: Callback) {
        req.one = true
        next()
      },
      function (req: any, res: any, next: Callback) {
        req.two = true
        next()
      }
    ])

    const req: any = {}
    const res: any = {}

    middleware(req, res, function (err) {
      expect(err).to.not.exist
      expect(req.one).to.be.true
      expect(req.two).to.be.true

      return done()
    })
  })

  it('should exit with an error', (done) => {
    const middleware = compose([
      function (req: any, res: any, next: Callback) {
        req.one = true
        next(new Error('test'))
      },
      function (req: any, res: any, next: Callback) {
        req.two = true
        next()
      }
    ])

    const req: any = {}
    const res: any = {}

    middleware(req, res, function (err) {
      expect(err).to.exist
      expect(req.one).to.be.true
      expect(req.two).to.not.exist

      return done()
    })
  })

  it('should short-cut handler with a single function', (done) => {
    const middleware = compose([
      function (req: any, res: any, next: Callback) {
        req.one = true
        next()
      }
    ])

    const req: any = {}
    const res: any = {}

    middleware(req, res, function (err) {
      expect(err).to.not.exist
      expect(req.one).to.be.true

      return done()
    })
  })

  it('should accept a single function', (done) => {
    const middleware = compose(function (req: any, res: any, next: Callback) {
      req.one = true
      next()
    })

    const req: any = {}

    middleware(req, {}, function (err: Error) {
      expect(err).to.not.exist
      expect(req.one).to.be.true

      return done()
    })
  })

  it('should noop with no middleware', (done) => {
    const middleware = compose(<Middleware[]> [])

    middleware({}, {}, done)
  })

  it('should validate all handlers are functions', () => {
    expect(() => compose(<any> ['foo'])).to.throw(TypeError, 'Handlers must be a function')
  })

  it('should support error handlers', (done) => {
    const middleware = compose(
      function (req: any, res: any, next: Callback) {
        return next(new Error('test'))
      },
      function (err: Error, req: any, res: any, next: Callback) {
        return next()
      },
      function (req: any, res: any, next: Callback) {
        req.success = true
        return next()
      }
    )

    const req: any = {}

    middleware(req, {}, function (err) {
      expect(req.success).to.be.true

      return done(err)
    })
  })
})
