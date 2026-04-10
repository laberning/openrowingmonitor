'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor
*/
/**
 * This creates an ordered series with labels and optional weights
 * It allows for efficient determining the Weighted Median, Number of Above and Below
 */
/* eslint-disable max-lines -- This code has to handle a lot of different situations */
export function createLabelledBinarySearchTree () {
  let tree = null

  /**
   * @param {float} label to use to destroy it later
   * @param {float} value to store
   * @param {float} weight attributed to the value (default = 1)
   */
  function push (label, value, weight = 1) {
    if (value === undefined || isNaN(value)) { return }
    if (tree === null) {
      tree = newNode(label, value, weight)
    } else {
      tree = pushInTree(tree, label, value, weight)
    }
  }

  /**
   * Helper function to actually push value in the current tree
   * @param {object} the current tree
   * @param {float} label to use to destroy it later
   * @param {float} value to store
   * @param {float} weight attributed to the value
   */
  function pushInTree (currentTree, label, value, weight) {
    if (value <= currentTree.value) {
      // The value should be on the left side of currentTree
      if (currentTree.leftNode === null) {
        currentTree.leftNode = newNode(label, value, weight)
      } else {
        currentTree.leftNode = pushInTree(currentTree.leftNode, label, value, weight)
      }
    } else {
      // The value should be on the right side of currentTree
      if (currentTree.rightNode === null) {
        currentTree.rightNode = newNode(label, value, weight)
      } else {
        currentTree.rightNode = pushInTree(currentTree.rightNode, label, value, weight)
      }
    }
    currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes + 1
    currentTree.totalWeight = currentTree.totalWeight + weight
    return currentTree
  }

  function newNode (label, value, weight) {
    return {
      label,
      value,
      weight,
      leftNode: null,
      rightNode: null,
      numberOfLeafsAndNodes: 1,
      totalWeight: weight
    }
  }

  /**
   * @result {integer} number of values stored in the tree
   */
  function size () {
    if (tree !== null) {
      return tree.numberOfLeafsAndNodes
    } else {
      return 0
    }
  }

  /**
   * @result {float} total weight stored in the tree
   */
  function totalWeight () {
    if (tree !== null) {
      return tree.totalWeight
    } else {
      return 0
    }
  }

  function minimum () {
    return minimumValueInTree(tree)
  }

  function minimumValueInTree (subTree) {
    if (subTree.leftNode === null) {
      return subTree.value
    } else {
      return minimumValueInTree(subTree.leftNode)
    }
  }

  function maximum () {
    return maximumValueInTree(tree)
  }

  function maximumValueInTree (subTree) {
    if (subTree.rightNode === null) {
      return subTree.value
    } else {
      return maximumValueInTree(subTree.rightNode)
    }
  }

  function numberOfValuesAbove (testedValue) {
    return countNumberOfValuesAboveInTree(tree, testedValue)
  }

  function countNumberOfValuesAboveInTree (currentTree, testedValue) {
    if (currentTree === null) {
      return 0
    } else {
      // We encounter a filled node
      if (currentTree.value > testedValue) {
        // testedValue < currentTree.value, so we can find the tested value in the left and right branch
        return (countNumberOfValuesAboveInTree(currentTree.leftNode, testedValue) + countNumberOfValuesAboveInTree(currentTree.rightNode, testedValue) + 1)
      } else {
        // currentTree.value < testedValue, so we need to find values from the right branch
        return countNumberOfValuesAboveInTree(currentTree.rightNode, testedValue)
      }
    }
  }

  function numberOfValuesEqualOrBelow (testedValue) {
    return countNumberOfValuesEqualOrBelowInTree(tree, testedValue)
  }

  function countNumberOfValuesEqualOrBelowInTree (currentTree, testedValue) {
    if (currentTree === null) {
      return 0
    } else {
      // We encounter a filled node
      if (currentTree.value <= testedValue) {
        // testedValue <= currentTree.value, so we can only find the tested value in the left branch
        return (countNumberOfValuesEqualOrBelowInTree(currentTree.leftNode, testedValue) + countNumberOfValuesEqualOrBelowInTree(currentTree.rightNode, testedValue) + 1)
      } else {
        // currentTree.value > testedValue, so we only need to look at the left branch
        return countNumberOfValuesEqualOrBelowInTree(currentTree.leftNode, testedValue)
      }
    }
  }

  function remove (label) {
    if (tree !== null) {
      tree = removeFromTree(tree, label)
    }
  }

  function removeFromTree (currentTree, label) {
    // Clean up the underlying sub-trees first
    if (currentTree.leftNode !== null) {
      currentTree.leftNode = removeFromTree(currentTree.leftNode, label)
    }
    if (currentTree.rightNode !== null) {
      currentTree.rightNode = removeFromTree(currentTree.rightNode, label)
    }

    // Next, handle the situation when we need to remove the node itself
    if (currentTree.label === label) {
      // First we need to remove the current node, then we need to investigate the underlying sub-trees to determine how it is resolved
      // We start by releasing the memory of the current node before we start to rearrange the tree, as this might cause a memory leak
      currentTree.label = null
      currentTree.value = null
      currentTree.weight = null
      currentTree.numberOfLeafsAndNodes = null
      currentTree.totalWeight = null
      switch (true) {
        case (currentTree.leftNode === null && currentTree.rightNode === null):
          // As the underlying sub-trees are empty as well, we return an empty tree
          currentTree = null
          break
        case (currentTree.leftNode !== null && currentTree.rightNode === null):
          // As only the left node contains data, we can simply replace the removed node with the left sub-tree
          currentTree = currentTree.leftNode
          break
        case (currentTree.leftNode === null && currentTree.rightNode !== null):
          // As only the right node contains data, we can simply replace the removed node with the right sub-tree
          currentTree = currentTree.rightNode
          break
        case (currentTree.leftNode !== null && currentTree.rightNode !== null):
          // As all underlying sub-trees are filled, we need to move a leaf to the now empty node. Here, we can be a bit smarter
          // as there are two potential nodes to use, we try to balance the tree a bit more as this increases performance
          if (currentTree.leftNode.numberOfLeafsAndNodes > currentTree.rightNode.numberOfLeafsAndNodes) {
            // The left sub-tree is bigger then the right one, lets use the closest predecessor to restore some balance
            const _closestPredecessor = closestPredecessor(currentTree.leftNode)
            currentTree.value = _closestPredecessor.value
            currentTree.label = _closestPredecessor.label
            currentTree.weight = _closestPredecessor.weight
            currentTree.leftNode = destroyclosestPredecessor(currentTree.leftNode)
          } else {
            // The right sub-tree is smaller then the right one, lets use the closest successor to restore some balance
            const _closestSuccesor = closestSuccesor(currentTree.rightNode)
            currentTree.value = _closestSuccesor.value
            currentTree.label = _closestSuccesor.label
            currentTree.weight = _closestSuccesor.weight
            currentTree.rightNode = destroyclosestSuccessor(currentTree.rightNode)
          }
          break
        // no default
      }
    }

    // Recalculate the tree size and total weight
    switch (true) {
      case (currentTree === null):
        // We are now an empty leaf, nothing to do here
        break
      case (currentTree.leftNode === null && currentTree.rightNode === null):
        // This is a filled leaf
        currentTree.numberOfLeafsAndNodes = 1
        currentTree.totalWeight = currentTree.weight
        break
      case (currentTree.leftNode !== null && currentTree.rightNode === null):
        currentTree.numberOfLeafsAndNodes = currentTree.leftNode.numberOfLeafsAndNodes + 1
        currentTree.totalWeight = currentTree.leftNode.totalWeight + currentTree.weight
        break
      case (currentTree.leftNode === null && currentTree.rightNode !== null):
        currentTree.numberOfLeafsAndNodes = currentTree.rightNode.numberOfLeafsAndNodes + 1
        currentTree.totalWeight = currentTree.rightNode.totalWeight + currentTree.weight
        break
      case (currentTree.leftNode !== null && currentTree.rightNode !== null):
        currentTree.numberOfLeafsAndNodes = currentTree.leftNode.numberOfLeafsAndNodes + currentTree.rightNode.numberOfLeafsAndNodes + 1
        currentTree.totalWeight = currentTree.leftNode.totalWeight + currentTree.rightNode.totalWeight + currentTree.weight
        break
      // no default
    }
    return currentTree
  }

  function closestPredecessor (currentTree) {
    // This function finds the maximum value in a tree
    if (currentTree.rightNode !== null) {
      // We haven't reached the end of the tree yet
      return closestPredecessor(currentTree.rightNode)
    } else {
      // We reached the largest value in the tree
      return {
        label: currentTree.label,
        value: currentTree.value,
        weight: currentTree.weight
      }
    }
  }

  function destroyclosestPredecessor (currentTree) {
    // This function finds the maximum value in a tree
    if (currentTree.rightNode !== null) {
      // We haven't reached the end of the tree yet
      currentTree.rightNode = destroyclosestPredecessor(currentTree.rightNode)
      currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes - 1
      let totalWeight = currentTree.weight
      if (currentTree.rightNode !== null && currentTree.rightNode.totalWeight !== undefined) { totalWeight += currentTree.rightNode.totalWeight }
      if (currentTree.leftNode !== null && currentTree.leftNode.totalWeight !== undefined) { totalWeight += currentTree.leftNode.totalWeight }
      currentTree.totalWeight = totalWeight
      return currentTree
    } else {
      // We reached the largest value in the tree
      // First, release the memory of the current node before we start to rearrange the tree, as this might cause a memory leak
      currentTree.label = null
      currentTree.value = null
      currentTree.weight = null
      currentTree.numberOfLeafsAndNodes = null
      currentTree.totalWeight = null
      return currentTree.leftNode
    }
  }

  function closestSuccesor (currentTree) {
    // This function finds the maximum value in a tree
    if (currentTree.leftNode !== null) {
      // We haven't reached the end of the tree yet
      return closestSuccesor(currentTree.leftNode)
    } else {
      // We reached the smallest value in the tree
      return {
        label: currentTree.label,
        value: currentTree.value,
        weight: currentTree.weight
      }
    }
  }

  function destroyclosestSuccessor (currentTree) {
    // This function finds the maximum value in a tree
    if (currentTree.leftNode !== null) {
      // We haven't reached the end of the tree yet
      currentTree.leftNode = destroyclosestSuccessor(currentTree.leftNode)
      currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes - 1
      let totalWeight = currentTree.weight
      if (currentTree.rightNode !== null && currentTree.rightNode.totalWeight !== undefined) { totalWeight += currentTree.rightNode.totalWeight }
      if (currentTree.leftNode !== null && currentTree.leftNode.totalWeight !== undefined) { totalWeight += currentTree.leftNode.totalWeight }
      currentTree.totalWeight = totalWeight
      return currentTree
    } else {
      // We reached the smallest value in the tree
      // First, release the memory of the current node before we start to rearrange the tree, as this might cause a memory leak
      currentTree.label = null
      currentTree.value = null
      currentTree.weight = null
      currentTree.numberOfLeafsAndNodes = null
      currentTree.totalWeight = null
      return currentTree.rightNode
    }
  }

  /**
   * BE AWARE, UNLIKE WITH ARRAYS, THE COUNTING STARTS WITH THE WEIGHT SUM! !!! !!!
   * THIS LOGIC THUS WORKS DIFFERENT THAN STANDARD MEDIAN! !!!!!!
   * @returns {float} the median of the tree
   */
  function median () {
    if (tree !== null && tree.numberOfLeafsAndNodes > 0) {
      // Standard median calculation (weight = 1 for all nodes)
      const mid = Math.floor(tree.numberOfLeafsAndNodes / 2)
      return tree.numberOfLeafsAndNodes % 2 !== 0 ? valueAtInorderPosition(tree, mid + 1) : (valueAtInorderPosition(tree, mid) + valueAtInorderPosition(tree, mid + 1)) / 2
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the weighed median of the entire tree, with linear interpolation between datapoints if needed
   */
  function weightedMedian () {
    if (!tree || tree.totalWeight === 0) { return undefined }

    const half = tree.totalWeight / 2
    const underNode = findUndershootingNode(tree, half, 0)
    const overNode = findOvershootingNode(tree, half, 0)

    switch (true) {
      case (!underNode && !overNode):
        return undefined
      case (!underNode):
        return overNode.value
      case (!overNode):
        return underNode.value
      case (underNode.cumulativeWeight === overNode.cumulativeWeight || (half === underNode.cumulativeWeight && underNode.value !== overNode.value)):
        // If at exact boundary or weights are equal, return average
        return (underNode.value + overNode.value) / 2
      default:
        // Interpolate based on where target falls in the weight range
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const interpolationFactor = (half - underNode.cumulativeWeight) / (overNode.cumulativeWeight - underNode.cumulativeWeight)
        return underNode.value + (overNode.value - underNode.value) * interpolationFactor
    }
  }

  /**
   * This helper function identifies the node that is closest below the set weight
   */
  function findUndershootingNode (node, targetWeight, accWeight = 0) {
    if (!node) { return null }

    const leftWeight = node.leftNode ? node.leftNode.totalWeight : 0
    const weightBeforeNode = accWeight + leftWeight
    const weightUpToNode = weightBeforeNode + node.weight

    switch (true) {
      case (targetWeight <= weightBeforeNode):
        return findUndershootingNode(node.leftNode, targetWeight, accWeight)
      case (targetWeight > weightUpToNode):
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const rightResult = findUndershootingNode(node.rightNode, targetWeight, weightUpToNode)
        return rightResult || { value: node.value, cumulativeWeight: weightUpToNode }
      default:
        return { value: node.value, cumulativeWeight: weightUpToNode }
    }
  }

  /**
   * This helper function identifies the node that is closest above the set weight
   */
  function findOvershootingNode (node, targetWeight, accWeight = 0) {
    if (!node) { return null }

    const leftWeight = node.leftNode ? node.leftNode.totalWeight : 0
    const weightBeforeNode = accWeight + leftWeight
    const weightUpToNode = weightBeforeNode + node.weight

    switch (true) {
      case (targetWeight < weightBeforeNode):
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const leftResult = findOvershootingNode(node.leftNode, targetWeight, accWeight)
        return leftResult || { value: node.value, cumulativeWeight: weightBeforeNode }
      case (targetWeight >= weightUpToNode):
        return findOvershootingNode(node.rightNode, targetWeight, weightUpToNode)
      default:
        return { value: node.value, cumulativeWeight: weightUpToNode }
    }
  }

  /**
   * @remark: BE AWARE TESTING PURPOSSES ONLY
   */
  function valueAtInorderPos (position) {
    if (tree !== null && position >= 1) {
      return valueAtInorderPosition(tree, position)
    } else {
      return undefined
    }
  }

  function valueAtInorderPosition (currentTree, position) {
    let currentNodePosition
    if (currentTree === null) {
      // We are now an empty tree, this shouldn't happen
      return undefined
    }

    // First we need to find out what the InOrder Postion we currently are at
    if (currentTree.leftNode !== null) {
      currentNodePosition = currentTree.leftNode.numberOfLeafsAndNodes + 1
    } else {
      currentNodePosition = 1
    }

    switch (true) {
      case (position === currentNodePosition):
        // The current position is the one we are looking for
        return currentTree.value
      case (currentTree.leftNode === null):
        // The current node's left side is empty, but position <> currentNodePosition, so we have no choice but to move downwards
        return valueAtInorderPosition(currentTree.rightNode, (position - 1))
      case (currentTree.leftNode !== null && currentNodePosition > position):
        // The position we look for is in the left side of the currentTree
        return valueAtInorderPosition(currentTree.leftNode, position)
      case (currentTree.leftNode !== null && currentNodePosition < position && currentTree.rightNode !== null):
        // The position we look for is in the right side of the currentTree
        return valueAtInorderPosition(currentTree.rightNode, (position - currentNodePosition))
      default:
        return undefined
    }
  }

  function orderedSeries () {
    return orderedTree(tree)
  }

  function orderedTree (currentTree) {
    if (currentTree === null) {
      return []
    } else {
      // We encounter a filled node
      return [...orderedTree(currentTree.leftNode), currentTree.value, ...orderedTree(currentTree.rightNode)]
    }
  }

  function reset () {
    resetTree(tree)
    tree = null
  }

  function resetTree (currentTree) {
    if (currentTree !== null) {
      currentTree.label = null
      currentTree.value = null
      currentTree.weight = null
      if (currentTree.leftNode !== null) {
        resetTree(currentTree.leftNode)
        currentTree.leftNode = null
      }
      if (currentTree.rightNode !== null) {
        resetTree(currentTree.rightNode)
        currentTree.rightNode = null
      }
      currentTree.numberOfLeafsAndNodes = null
      currentTree.totalWeight = null
    }
  }

  return {
    push,
    remove,
    size,
    totalWeight,
    numberOfValuesAbove,
    numberOfValuesEqualOrBelow,
    minimum,
    maximum,
    median,
    weightedMedian,
    valueAtInorderPos,
    orderedSeries,
    reset
  }
}
