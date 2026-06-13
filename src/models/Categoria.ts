// Model de categoria dos cursos.
import { z } from "zod";
import { idSchema, textSchema, type RecordId } from "./common";

export class Categoria {
    static schema = z.object({
        id: idSchema,
        nome: textSchema,
        descricao: textSchema
    });

    constructor(
        public id: RecordId,
        public nome: string,
        public descricao: string
    ) { }
}
