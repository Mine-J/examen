import { MongoClient } from 'mongodb'
import { User, UserModel } from "./types.ts";
import { deleteUser, getAllUsers, getEmailUsers, getNameUsers, postUser } from "./resolvers.ts";


const url = Deno.env.get("mongo");

if(!url)
{
  Deno.exit(1);
}
const client = new MongoClient(url);

// Database Name
const dbName = 'examen';



await client.connect();

const db = client.db(dbName);
const UsersCollection = db.collection<UserModel>('users');
const handler = async(req:Request):Promise<Response> => {

  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if(method === "GET")
  {
    if(path === "/personas")
    {
      const nombre = url.searchParams.get('nombre')
      
      if(nombre)
      {
        return await getNameUsers(nombre,UsersCollection);
      }else{
        return await getAllUsers(UsersCollection);
      }
    }else if(path === "/persona")
    {
      const email = url.searchParams.get('email')
      if(email){
        return await getEmailUsers(email,UsersCollection);
      }else
      {
        return new Response()
      }

    }
  }else if(method === "POST")
  {
    if(path === "/personas")
    {
      const body = (await req.json())
      if(!body.id && (body.email && body.telefono && body.nombre))
      {
        return postUser(body,UsersCollection);
      }
    }
  }else if(method === "PUT")
  {

  }else if(method === "DELETE")
  {
    if(path === "/persona")
      {
        const body = (await req.json())
        if(body.email)
        {
          return deleteUser(body,UsersCollection);
        }else{
          return new Response("Falta email", {status:400})
        }
      }
  }
  return new Response("ENDPOINT NO ENCONTRADO",{status:404})
}

Deno.serve({port:3000},handler)


