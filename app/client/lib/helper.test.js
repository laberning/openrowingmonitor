'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { filterObjectByKeys } from './helper.js'

test('filterd list should only contain the elements specified', () => {
  const object1 = {
    a: ['a1', 'a2'],
    b: 'b'
  }

  const object2 = {
    a: ['a1', 'a2']
  }

  const filteredObject = filterObjectByKeys(object1, ['a'])
  assert.equal(filterObjectByKeys(filteredObject, ['a']), object2)
})

test.run()
