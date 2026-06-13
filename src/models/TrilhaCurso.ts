// Model que liga trilhas e cursos.
import { z } from "zod";
import { idSchema, numberSchema, type RecordId } from "./common";

export class TrilhaCurso {
    static schema = z.object({
        id: idSchema,
        idTrilha: numberSchema,
        idCurso: numberSchema,
        ordem: numberSchema
    });

    constructor(
        public id: RecordId,
        public idTrilha: number,
        public idCurso: number,
        public ordem: number
    ) { }
}
