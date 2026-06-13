// Model de modulo pertencente a um curso.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Modulo {
    static schema = z.object({
        id: idSchema,
        idCurso: numberSchema,
        titulo: textSchema,
        ordem: numberSchema
    });

    constructor(
        public id: RecordId,
        public idCurso: number,
        public titulo: string,
        public ordem: number
    ) { }
}
