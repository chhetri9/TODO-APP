import { Client, Databases, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1') 
  .setProject('688871ed0006d8cf4667');              

const databases = new Databases(client);
const databaseId = '688873880013a454c8bb';
const collectionId = '6888739100327044a9b2';

export { databases, databaseId, collectionId, ID };