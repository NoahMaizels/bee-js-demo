import { Bee } from '@ethersphere/bee-js'
import { promises as fs } from 'fs'
import path from 'path'

const BEE_URL = 'http://127.0.0.1:1633'
const bee = new Bee(BEE_URL)

// Function to create or retrieve an existing postage batch
async function getOrCreatePostageBatch() {
  let batchId
  const batches = await bee.getAllPostageBatch()
  const usable = batches.find(x => x.usable)

  if (usable) {
    batchId = usable.batchID
  } else {
    batchId = await bee.createPostageBatch('500000000', 17)
  }

  return batchId
}

// Function to upload file data with redundancy and encryption
async function uploadFileWithRedundancyAndEncryption(filePath) {
  const batchId = await getOrCreatePostageBatch()
  const fileData = await fs.readFile(filePath, 'utf-8')

  const options = {
    encrypt: true,
    redundancyLevel: 1, // Set redundancy level
  }

  const uploadResult = await bee.uploadData(batchId, fileData, options)
  return uploadResult.reference
}

// Function to download data
async function downloadData(reference) {
  const downloadResult = await bee.downloadData(reference)
  const data = await downloadResult.text()

  return data
}

async function main() {
  const filePath = path.resolve('test.txt')

  console.log('Uploading file...')
  const reference = await uploadFileWithRedundancyAndEncryption(filePath)
  console.log(`File uploaded with reference: ${reference}`)

  console.log('Downloading file...')
  const downloadedData = await downloadData(reference)
  console.log(`Downloaded file data: ${downloadedData}`)
}

main().catch(console.error)
