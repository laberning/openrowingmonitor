'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This creates an ordered series with labels
  It allows for efficient determining the Median, Number of Above and Below
*/

function createLabelledBinarySearchTree () {
  let tree = null

  function push (label, value) {
    if (tree === null) {
      tree = newNode(label, value)
    } else {
      // pushInTree(tree, label, value)
      tree = pushInTree(tree, label, value)
    }
  }

  function pushInTree (currentTree, label, value) {
    if (value <= currentTree.value) {
      // The value should be on the left side of currentTree
      if (currentTree.leftNode === null) {
        currentTree.leftNode = newNode(label, value)
      } else {
        currentTree.leftNode = pushInTree(currentTree.leftNode, label, value)
      }
    } else {
      // The value should be on the right side of currentTree
      if (currentTree.rightNode === null) {
        currentTree.rightNode = newNode(label, value)
      } else {
        currentTree.rightNode = pushInTree(currentTree.rightNode, label, value)
      }
    }
    currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes + 1
    return currentTree
  }

  function newNode (label, value) {
    return {
      label,
      value,
      leftNode: null,
      rightNode: null,
      numberOfLeafsAndNodes: 1
    }
  }

  function size () {
    if (tree !== null) {
      return tree.numberOfLeafsAndNodes
    } else {
      return 0
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
      // We need to remove the current node, the underlying sub-trees determin how it is resolved
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
            currentTree.value = clostestPredecessor(currentTree.leftNode).value
            currentTree.label = clostestPredecessor(currentTree.leftNode).label
            currentTree.leftNode = destroyClostestPredecessor(currentTree.leftNode)
          } else {
            // The right sub-tree is smaller then the right one, lets use the closest successor to restore some balance
            currentTree.value = clostestSuccesor(currentTree.rightNode).value
            currentTree.label = clostestSuccesor(currentTree.rightNode).label
            currentTree.rightNode = destroyClostestSuccessor(currentTree.rightNode)
          }
          break
      }
    }

    // Recalculate the tree size
    switch (true) {
      case (currentTree === null):
        // We are now an empty leaf, nothing to do here
        break
      case (currentTree.leftNode === null && currentTree.rightNode === null):
        // This is a filled leaf
        currentTree.numberOfLeafsAndNodes = 1
        break
      case (currentTree.leftNode !== null && currentTree.rightNode === null):
        currentTree.numberOfLeafsAndNodes = currentTree.leftNode.numberOfLeafsAndNodes + 1
        break
      case (currentTree.leftNode === null && currentTree.rightNode !== null):
        currentTree.numberOfLeafsAndNodes = currentTree.rightNode.numberOfLeafsAndNodes + 1
        break
      case (currentTree.leftNode !== null && currentTree.rightNode !== null):
        currentTree.numberOfLeafsAndNodes = currentTree.leftNode.numberOfLeafsAndNodes + currentTree.rightNode.numberOfLeafsAndNodes + 1
        break
    }
    return currentTree
  }

  function clostestPredecessor (currentTree) {
    // This function finds the maximum value in a tree
    if (currentTree.rightNode !== null) {
      // We haven't reached the end of the tree yet
      return clostestPredecessor(currentTree.rightNode)
    } else {
      // We reached the largest value in the tree
      return {
        label: currentTree.label,
        value: currentTree.value
      }
    }
  }

  function destroyClostestPredecessor (currentTree) {
    // This function finds the maximum value in a tree
    if (currentTree.rightNode !== null) {
      // We haven't reached the end of the tree yet
      currentTree.rightNode = destroyClostestPredecessor(currentTree.rightNode)
      currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes - 1
      return currentTree
    } else {
      // We reached the largest value in the tree
      return currentTree.leftNode
    }
  }

  function clostestSuccesor (currentTree) {
    // This function finds the maximum value in a tree
    if (currentTree.leftNode !== null) {
      // We haven't reached the end of the tree yet
      return clostestSuccesor(currentTree.leftNode)
    } else {
      // We reached the smallest value in the tree
      return {
        label: currentTree.label,
        value: currentTree.value
      }
    }
  }

  function destroyClostestSuccessor (currentTree) {
    // This function finds the maximum value in a tree
    if (currentTree.leftNode !== null) {
      // We haven't reached the end of the tree yet
      currentTree.leftNode = destroyClostestSuccessor(currentTree.leftNode)
      currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes - 1
      return currentTree
    } else {
      // We reached the smallest value in the tree
      return currentTree.rightNode
    }
  }

  function median () {
    if (tree !== null && tree.numberOfLeafsAndNodes > 0) {
      // BE AWARE, UNLIKE WITH ARRAYS, THE COUNTING OF THE ELEMENTS STARTS WITH 1 !!!!!!!
      // THIS LOGIC THUS WORKS DIFFERENT THAN MOST ARRAYS FOUND IN ORM!!!!!!!
      const mid = Math.floor(tree.numberOfLeafsAndNodes / 2)
      return tree.numberOfLeafsAndNodes % 2 !== 0 ? valueAtInorderPosition(tree, mid + 1) : (valueAtInorderPosition(tree, mid) + valueAtInorderPosition(tree, mid + 1)) / 2
    } else {
      return 0
    }
  }

  function valueAtInorderPos (position) { // BE AWARE TESTING PURPOSSES ONLY
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
    tree = null
  }

  return {
    push,
    remove,
    size,
    numberOfValuesAbove,
    numberOfValuesEqualOrBelow,
    median,
    valueAtInorderPos, // BE AWARE TESTING PURPOSSES ONLY
    orderedSeries,
    reset
  }
}

export { createLabelledBinarySearchTree }
