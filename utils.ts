import { User, UserModel } from "./types.ts";
import { type Collection, ObjectId } from "mongodb";

export const personasModelToPersonas = (
    personaModel:UserModel
):User => {
    const persona:User = {
        id:personaModel._id.toString(),
        nombre:personaModel.nombre,
        email:personaModel.email,
        telefono:personaModel.telefono,
        amigos: personaModel.amigos.length > 0 ? personaIdToString(personaModel.amigos): []
    }
    return persona;
}

export const personaIdToString = (
    _ids:ObjectId[]
):string[] => {
    const ids:string[] = _ids.map(e => ({
        id:e.toString()
    }))
    return ids;
}

export const personasToPersonasModel = async(
    personaModel:User,
    UsersCollection:Collection<UserModel>
):Promise<UserModel> => {
    const persona:UserModel = {
        _id:new ObjectId(personaModel.id),
        nombre:personaModel.nombre,
        email:personaModel.email,
        telefono:personaModel.telefono,
        amigos: personaModel.amigos.length > 0 ? await personaStringToId(personaModel.amigos,UsersCollection): []
    }
    return persona;
}

export const personaStringToId = async(
    ids:User[],
    UsersCollection:Collection<UserModel>
):Promise<ObjectId[]> => {
    const amigos:UserModel[] = await UsersCollection.findOne({email:{$in:ids}});
    if(amigos)
    {
        const idAmigos:ObjectId[] = amigos.map(e => e._id);
        return idAmigos;
    }
    
    return [];
    
}