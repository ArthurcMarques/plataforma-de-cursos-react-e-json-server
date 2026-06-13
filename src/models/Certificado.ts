// Model de certificado emitido para usuario.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Certificado {
    static schema = z.object({
        id: idSchema,
        idUsuario: numberSchema,
        idCurso: numberSchema,
        idTrilha: z.union([numberSchema, z.null()]),
        codigoVerificacao: textSchema,
        dataEmissao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: number,
        public idCurso: number,
        public idTrilha: number | null,
        public codigoVerificacao: string,
        public dataEmissao: string
    ) { }
}
