// Model de assinatura de usuario em um plano.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Assinatura {
    static schema = z.object({
        id: idSchema,
        idUsuario: idSchema,
        idPlano: idSchema,
        dataInicio: textSchema,
        dataFim: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: RecordId,
        public idPlano: RecordId,
        public dataInicio: string,
        public dataFim: string
    ) { }
}
