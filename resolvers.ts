import { ObjectId, type Collection } from "mongodb";
import { User, UserModel } from "./types.ts";
import { personasModelToPersonas, personasToPersonasModel } from "./utils.ts";

export const getAllUsers = async(
    UsersCollection:Collection<UserModel>
):Promise<Response> => {
    const personasModel = await UsersCollection.find({}).toArray();
    const personas = personasModel.map(e => personasModelToPersonas(e));
    if(personas)
    {
        return new Response(JSON.stringify(personas),{status:200})
    }else{
        return new Response("No se han podido mostrar las personas",{status:404})
    }
}   

export const getNameUsers = async(
    nombre:string,
    UsersCollection:Collection<UserModel>
):Promise<Response> => {
    const personaNombreModel = await UsersCollection.find({nombre}).toArray();
    if(personaNombreModel)
    {
        const personaNombre:User[] = personaNombreModel.map(e => personasModelToPersonas(e));
        return new Response(JSON.stringify(personaNombre),{status:200});
    }else{
        return new Response("Persona no encontrada.",{status:200});
    }
}

export const getEmailUsers = async(
    email:string,
    UsersCollection:Collection<UserModel>
):Promise<Response> => {
    const personaEmailModel = await UsersCollection.findOne({email});
    if(personaEmailModel)
    {
        const personaEmail:User = personasModelToPersonas(personaEmailModel);
        return new Response(JSON.stringify(personaEmail),{status:200});
    }else{
        return new Response("No se han podido mostrar las personas con ese email",{status:200});
    }
}

export const deleteUser = async(
    body: User,
    UsersCollection:Collection<UserModel>
):Promise<Response> => {
    const usuario = await UsersCollection.findOne({email:body.email})
    const {deletedCount} = await UsersCollection.deleteOne({email:body.email});
    if(deletedCount > 0)
    {
        const actualizarUsuarios = await UsersCollection.updateMany(
            {amigos:usuario?._id},
            {$pull: {amigos:usuario?._id}}
        )
        return new Response("Persona eliminada exitosamente", {status:200})
    }else 
    {
        return new Response("Usuario no encontrado.",{status:404})
    }
}

export const postUser = async(
    body: User,
    UsersCollection:Collection<UserModel>
):Promise<Response> => {
    const existeEmail = await UsersCollection.find({email:body.email}).toArray();
    const existeTelefono = await UsersCollection.find({telefono:body.telefono}).toArray();
    if(existeEmail.length > 0 && existeTelefono.length > 0)
    {
        return new Response("El email o teléfono ya están registrados.",{status:400})
        
    }else
    {
        const personaAgregar = await personasToPersonasModel(body,UsersCollection);
        const {insertedId} = await UsersCollection.insertOne(personaAgregar);
        if(!insertedId)
        {
            return new Response("No se ha podido añadir al usuario",{status:404})
        }else
        {
            return new Response( "Persona creada exitosamente, /n Persona:" + JSON.stringify(body),{status:201})
        }
    }
}