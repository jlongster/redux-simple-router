import expect, { createSpy } from 'expect'

import { push, replace } from '../src/actions'
import routerMiddleware from '../src/middleware'

describe('routerMiddleware', () => {
  let history, next, dispatch

  beforeEach(() => {
    history = {
      push: createSpy(),
      replace: createSpy(),
      getCurrentLocation: () => ({ pathname: '/bar' })
    }
    next = createSpy()

    dispatch = routerMiddleware(history)()(next)
  })

  it('calls the appropriate history method', () => {
    dispatch(push('/foo'))
    expect(history.push).toHaveBeenCalled()

    dispatch(replace('/foo'))
    expect(history.replace).toHaveBeenCalled()

    expect(next).toNotHaveBeenCalled()
  })

  it('ignores other actions', () => {
    history.getCurrentLocation = () => ({ pathname: '/foo' })
    dispatch(push('/foo'))
    expect(history.push).toNotHaveBeenCalled()

    dispatch({ type: 'FOO' })
    expect(next).toHaveBeenCalled()
  })
})
