import mongoose from 'mongoose';
import configurations from '../../server-basic-configurations';

export default async(): Promise<mongoose.Connection> =>{
    return new Promise((resolve) => {
        mongoose.createConnection(configurations.MongoUrl).then(connection => resolve(connection));
    })
}

export const ConnectMongoDB = async() =>{
    await mongoose.connect(configurations.MongoUrl, {useNewUrlParser: true, useUnifiedTopology: true});
}