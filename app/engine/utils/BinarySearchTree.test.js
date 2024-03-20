'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  As this object is fundamental for most other utility objects, we must test its behaviour quite thoroughly
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

test('Series behaviour with an empty tree', () => {
  const dataTree = createLabelledBinarySearchTree()
  testSize(dataTree, 0)
  testNumberOfValuesAbove(dataTree, 0, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 0)
  testMedian(dataTree, 0)
})

test('Tree behaviour with a single pushed value. Tree = [9]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(1, 9)
  testOrderedSeries(dataTree, [9])
  testSize(dataTree, 1)
  testValueAtInorderPos(dataTree, 1, 9)
  testNumberOfValuesAbove(dataTree, 0, 1)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 1)
  testMedian(dataTree, 9)
})

test('Tree behaviour with a second pushed value. Tree = [9, 3]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(1, 9)
  dataTree.push(2, 3)
  testOrderedSeries(dataTree, [3, 9])
  testSize(dataTree, 2)
  testValueAtInorderPos(dataTree, 1, 3)
  testValueAtInorderPos(dataTree, 2, 9)
  testNumberOfValuesAbove(dataTree, 0, 2)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
  testMedian(dataTree, 6)
})

test('Tree behaviour with a third pushed value. Tree = [9, 3, 6]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(1, 9)
  dataTree.push(2, 3)
  dataTree.push(3, 6)
  testOrderedSeries(dataTree, [3, 6, 9])
  testSize(dataTree, 3)
  testValueAtInorderPos(dataTree, 1, 3)
  testValueAtInorderPos(dataTree, 2, 6)
  testValueAtInorderPos(dataTree, 3, 9)
  testNumberOfValuesAbove(dataTree, 0, 3)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 3)
  testMedian(dataTree, 6)
})

test('Tree behaviour with a fourth pushed value. Tree = [3, 6, 12]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(1, 9)
  dataTree.push(2, 3)
  dataTree.push(3, 6)
  dataTree.remove(1)
  dataTree.push(4, 12)
  testOrderedSeries(dataTree, [3, 6, 12])
  testSize(dataTree, 3)
  testValueAtInorderPos(dataTree, 1, 3)
  testValueAtInorderPos(dataTree, 2, 6)
  testValueAtInorderPos(dataTree, 3, 12)
  testNumberOfValuesAbove(dataTree, 0, 3)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 1)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
  testMedian(dataTree, 6)
})

test('Tree behaviour with a fifth pushed value. Series = [6, 12, -3]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(1, 9)
  dataTree.push(2, 3)
  dataTree.push(3, 6)
  dataTree.remove(1)
  dataTree.push(4, 12)
  dataTree.remove(2)
  dataTree.push(5, -3)
  testOrderedSeries(dataTree, [-3, 6, 12])
  testSize(dataTree, 3)
  testValueAtInorderPos(dataTree, 1, -3)
  testValueAtInorderPos(dataTree, 2, 6)
  testValueAtInorderPos(dataTree, 3, 12)
  testNumberOfValuesAbove(dataTree, 0, 2)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 1)
  testNumberOfValuesAbove(dataTree, 10, 1)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
  testMedian(dataTree, 6)
})

test('Tree behaviour with complex removals. Series = [9, 6, 5, 8, 7, 9, 12, 10, 11]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(1, 9)
  dataTree.push(2, 6)
  dataTree.push(3, 5)
  dataTree.push(4, 8)
  dataTree.push(5, 7)
  dataTree.push(6, 9)
  dataTree.push(7, 12)
  dataTree.push(8, 10)
  dataTree.push(9, 11)
  testOrderedSeries(dataTree, [5, 6, 7, 8, 9, 9, 10, 11, 12])
  testSize(dataTree, 9)
  testValueAtInorderPos(dataTree, 5, 9)
  testMedian(dataTree, 9)
  dataTree.remove(1)
  testOrderedSeries(dataTree, [5, 6, 7, 8, 9, 10, 11, 12])
  testSize(dataTree, 8)
  testValueAtInorderPos(dataTree, 4, 8)
  testValueAtInorderPos(dataTree, 5, 9)
  testMedian(dataTree, 8.5)
  dataTree.remove(3)
  testOrderedSeries(dataTree, [6, 7, 8, 9, 10, 11, 12])
  testSize(dataTree, 7)
  testValueAtInorderPos(dataTree, 4, 9)
  testMedian(dataTree, 9)
})

// Test based on https://levelup.gitconnected.com/deletion-in-binary-search-tree-with-javascript-fded82e1791c
test('Tree behaviour with complex removals. Series = [50, 30, 70, 20, 40, 60, 80]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(1, 50)
  dataTree.push(2, 30)
  dataTree.push(3, 70)
  dataTree.push(4, 20)
  dataTree.push(5, 40)
  dataTree.push(6, 60)
  dataTree.push(7, 80)
  testOrderedSeries(dataTree, [20, 30, 40, 50, 60, 70, 80])
  testSize(dataTree, 7)
  testValueAtInorderPos(dataTree, 4, 50)
  dataTree.remove(4)
  testOrderedSeries(dataTree, [30, 40, 50, 60, 70, 80])
  testSize(dataTree, 6)
  testValueAtInorderPos(dataTree, 3, 50)
  testValueAtInorderPos(dataTree, 4, 60)
  testMedian(dataTree, 55)
  dataTree.remove(2)
  testOrderedSeries(dataTree, [40, 50, 60, 70, 80])
  testSize(dataTree, 5)
  testValueAtInorderPos(dataTree, 3, 60)
  testMedian(dataTree, 60)
  dataTree.remove(1)
  testOrderedSeries(dataTree, [40, 60, 70, 80])
  testSize(dataTree, 4)
  testValueAtInorderPos(dataTree, 2, 60)
  testValueAtInorderPos(dataTree, 3, 70)
  testMedian(dataTree, 65)
})

test('Tree behaviour with a five pushed values followed by a reset, Tree = []', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(1, 9)
  dataTree.push(2, 3)
  dataTree.push(3, 6)
  dataTree.push(4, 12)
  dataTree.push(5, -3)
  dataTree.reset()
  testSize(dataTree, 0)
  testNumberOfValuesAbove(dataTree, 0, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 0)
  testMedian(dataTree, 0)
})

function testSize (tree, expectedValue) {
  assert.ok(tree.size() === expectedValue, `Expected size should be ${expectedValue}, encountered ${tree.size()}`)
}

function testNumberOfValuesAbove (tree, cutoff, expectedValue) {
  assert.ok(tree.numberOfValuesAbove(cutoff) === expectedValue, `Expected numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered ${tree.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfValuesEqualOrBelow (tree, cutoff, expectedValue) {
  assert.ok(tree.numberOfValuesEqualOrBelow(cutoff) === expectedValue, `Expected numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered ${tree.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testOrderedSeries (tree, expectedValue) {
  assert.ok(tree.orderedSeries().toString() === expectedValue.toString(), `Expected ordered series to be ${expectedValue}, encountered ${tree.orderedSeries()}`)
}

function testValueAtInorderPos (tree, position, expectedValue) {
  assert.ok(tree.valueAtInorderPos(position) === expectedValue, `Expected valueAtInorderPos(${position}) to be ${expectedValue}, encountered ${tree.valueAtInorderPos(position)}`)
}

function testMedian (tree, expectedValue) {
  assert.ok(tree.median() === expectedValue, `Expected median to be ${expectedValue}, encountered ${tree.median()}`)
}

test.run()
