import { describe, it, expect } from 'vitest'
import * as utils from '../../src/utils'

describe('utils/index', () => {
  it('should export formatDate', () => {
    expect(utils.formatDate).toBeDefined()
    expect(typeof utils.formatDate).toBe('function')
  })

  it('should export validationRules', () => {
    expect(utils.validationRules).toBeDefined()
    expect(typeof utils.validationRules).toBe('object')
    expect(utils.validationRules.required).toBeDefined()
    expect(utils.validationRules.namePattern).toBeDefined()
    expect(utils.validationRules.descriptionPattern).toBeDefined()
  })

  it('should export Developer Edition auth bootstrap helpers', () => {
    expect(utils.bootstrapDevAuthFromUrl).toBeDefined()
    expect(typeof utils.bootstrapDevAuthFromUrl).toBe('function')
    expect(utils.clearDevAuthLocalStorage).toBeDefined()
    expect(typeof utils.clearDevAuthLocalStorage).toBe('function')
  })
})
