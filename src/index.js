import { createServer } from '@graphql-yoga/node'
import {v4 as uuidv4 } from 'uuid'
const pessoas = [{
  id: '1',
  nome: 'Cormen',
  idade: 19
},
{
  id: '2',
  nome: 'Velleman',
  idade: 22
}
]

const livros = [{
  id: '100',
  titulo: 'Introduction to Algorithms',
  edicao: 3,
  autor: '1'
},
{
  id: '101',
  titulo: 'How to Prove it',
  edicao: 2,
  autor: '2'
}
]

const comentarios = [
  {
    id: "1001",
    texto: "excelente",
    nota: 5,
    livro: "101",
    autor: '1'
  },
  {
    id: "1002",
    texto: "Gostei muito",
    nota: 5,
    livro: "101",
    autor: '1'
  },
  {
    id: "1003",
    texto: "Bacana",
    nota: 4,
    livro: "100",
    autor: '1'
  },
];


const typeDefs = `
  type Pessoa {
    id: ID!
    nome: String!
    idade: Int
    livros: [Livro!]!
    comentarios: [Comentario!]!
  }
  type Livro {
    id: ID!
    titulo: String!
    edicao: Int!
    autor: Pessoa!
    comentarios: [Comentario!]!
  }

  type Comentario {
    id: ID!
    texto: String!
    nota: Int!
    livro: Livro!
    autor: Pessoa!
  }

  type Query {
    livros: [Livro!]!
    pessoas: [Pessoa!]!
    comentarios: [Comentario!]!
  }
  type Mutation{
    inserirPessoa (pessoa: InserirPessoaInput): Pessoa!
    inserirLivro (livro: InserirLivroInput): Livro!
    inserirComentario (comentario: InserirComentarioInput): Comentario! 
  }

  input InserirLivroInput{
    titulo: String!
    edicao: Int!
    autor: ID!
   }

  input InserirPessoaInput {
    nome: String!
    idade: Int
  }

  input InserirComentarioInput {
    texto: String!
    nota: Int!
    livro: ID!
    autor: ID!
  }
`;

const resolvers = {
  Query: {
    livros(){
      return livros
    },
    pessoas(){
      return pessoas
    },
    comentarios(){
      return comentarios
    }  
  },
  Mutation:  {
    inserirPessoa (parents, args, ctx, info){
      const pessoa ={
        id: uuidv4(),
        nome: args.pessoa.nome,
        idade: args.pessoa.idade
      }
      pessoas.push(pessoa)
      return pessoa
    },
    inserirLivro (parent, args, ctx, info){
      const autorExiste = pessoas.some((pessoa) => pessoa.id === args.livro.autor);
      if (!autorExiste){
        throw new Error ("Autor não existe")
      }
      const livro = {
        id: uuidv4(),
        titulo: args.livro.titulo,
        edicao: args.livro.edicao,
        autor: args.livro.autor
      };
      livros.push(livro);
      return livro;
    },
    inserirComentario (parent, args, ctx, info){
      if (!pessoas.some((pessoa) => pessoa.id === args.comentario.autor) ||
          !livros.some((livro) => livro.id === args.comentario.livro)){
            throw new Error ('Autor e/ou Livro inexistente')
      }
      const comentario = {
        id: uuidv4(),
        texto: args.comentario.texto,
        nota: args.comentario.nota,
        livro: args.comentario.livro,
        autor: args.comentario.autor 
      }
      comentarios.push(comentario);
      return comentario;
          
}
  },
  Livro: {
    autor (parent, args, ctx, info){
      return pessoas.find(pessoa => pessoa.id === parent.autor)
    },
    comentarios (parent, args, ctx, info){
      return comentarios.filter (c => c.livro === parent.id)
    }
  },
  Pessoa: {
    livros (parent, args, ctx, info){
      return livros.filter (l => l.autor === parent.id)
    },
    comentarios (parent, args, ctx, info){
      return comentarios.filter (c => c.autor === parent.id)
    }
  },
  Comentario: {
    livro (parent, args, ctx, info){
      return livros.find(l => l.id === parent.livro)
    },
    autor (parent, args, ctx, info){
      console.log(parent)
      return pessoas.find(p => p.id === parent.autor)  
    }
  }
};

const server = createServer ({
  schema: {
    typeDefs,
    resolvers
  }
})

server.start(() => {
  'Servidor no ar...'
})