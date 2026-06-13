// Model de trilha de conhecimento.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Trilha {
    static schema = z.object({
        id: idSchema,
        titulo: textSchema,
        descricao: textSchema,
        idCategoria: idSchema
    });

    constructor(
        public id: RecordId,
        public titulo: string,
        public descricao: string,
        public idCategoria: RecordId
    ) { }
}
