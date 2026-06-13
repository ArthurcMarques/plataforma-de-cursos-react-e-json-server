import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Plano {
    static schema = z.object({
        id: idSchema,
        nome: textSchema,
        descricao: textSchema,
        preco: numberSchema,
        duracaoMeses: numberSchema
    });

    constructor(
        public id: RecordId,
        public nome: string,
        public descricao: string,
        public preco: number,
        public duracaoMeses: number
    ) { }
}
