// Model de matricula de usuario em curso.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Matricula {
    static schema = z.object({
        id: idSchema,
        idUsuario: numberSchema,
        idCurso: numberSchema,
        dataMatricula: textSchema,
        dataConclusao: z.union([textSchema, z.null()])
    });

    constructor(
        public id: RecordId,
        public idUsuario: number,
        public idCurso: number,
        public dataMatricula: string,
        public dataConclusao: string | null
    ) { }
}
