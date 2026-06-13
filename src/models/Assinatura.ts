import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Assinatura {
    static schema = z.object({
        id: idSchema,
        idUsuario: numberSchema,
        idPlano: numberSchema,
        dataInicio: textSchema,
        dataFim: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: number,
        public idPlano: number,
        public dataInicio: string,
        public dataFim: string
    ) { }
}
