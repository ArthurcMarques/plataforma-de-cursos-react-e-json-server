import { z } from "zod";
import { idSchema, textSchema, type RecordId } from "./common";

export class Usuario {
    static schema = z.object({
        id: idSchema,
        nomeCompleto: textSchema,
        email: textSchema,
        senha: textSchema,
        dataCadastro: textSchema,
        tipoUsuario: z.enum(["Aluno", "Instrutor"])
    });

    constructor(
        public id: RecordId,
        public nomeCompleto: string,
        public email: string,
        public senha: string,
        public dataCadastro: string,
        public tipoUsuario: "Aluno" | "Instrutor"
    ) { }
}
