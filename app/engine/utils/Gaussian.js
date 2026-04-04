'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This implements a Gausian weight function, which is used in the moving regression filter
 * @see {@link https://en.wikipedia.org/wiki/Kernel_(statistics)#Kernel_functions_in_common_use|the description of the various kernels}
 * Please realize the constant factor 1/Math.Pow(2 * Math.pi(), 0.5) is omitted as it cancels out in the subsequent weight averaging filtering
 */
let begin
let end
let halfLength
let middle

export function createGaussianWeightFunction () {
  begin = 0
  end = 0
  halfLength = 0
  middle = 0

  function setWindowWidth (beginpos, endpos) {
    begin = beginpos
    end = endpos
    halfLength = (end - begin) / 2
    middle = halfLength + begin
  }

  function weight (position) {
    if (position >= begin && end >= position) {
      const normalizedDistance = Math.abs((middle - position) / halfLength)
      return Math.exp(-0.5 * Math.pow(normalizedDistance, 2))
    } else {
      return 0
    }
  }

  return {
    setWindowWidth,
    weight
  }
}
