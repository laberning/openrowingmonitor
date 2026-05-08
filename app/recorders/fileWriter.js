'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module writes the contents of file to disk (in gzip-format if needed)
*/
import log from 'loglevel'
import zlib from 'zlib'
import fs from 'fs/promises'
import { promisify } from 'util'
const gzip = promisify(zlib.gzip)

export function createFileWriter () {
  let basefilename

  function setBaseFileName (baseFileName) {
    basefilename = `${baseFileName}`
  }

  async function writeFile (recorder, compress = false) {
    let filename
    if (compress) {
      filename = `${basefilename}${recorder.postfix}.${recorder.type}.gz`
    } else {
      filename = `${basefilename}${recorder.postfix}.${recorder.type}`
    }

    // we need enough data
    if (!recorder.minimumDataAvailable()) {
      log.info(`${recorder.presentationName} file has not been written, as there was not enough data recorded`)
      return
    }

    const fileContent = await recorder.fileContent()

    if (fileContent === undefined) {
      log.error(`Error creating ${recorder.presentationName} file`)
    } else {
      await createFile(fileContent, `${filename}`, compress)
      recorder.allDataHasBeenWritten = true
      log.info(`${recorder.presentationName}-file has been saved as ${filename}`)
    }
  }

  async function createFile (content, filename, compress) {
    if (compress) {
      const gzipContent = await gzip(content)
      try {
        await fs.writeFile(filename, gzipContent)
      } catch (err) {
        log.error(err)
      }
    } else {
      try {
        await fs.writeFile(filename, content)
      } catch (err) {
        log.error(err)
      }
    }
  }

  return {
    setBaseFileName,
    writeFile
  }
}
