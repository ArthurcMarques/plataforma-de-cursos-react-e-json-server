import { z } from "zod";

export type CollectionName =
    | "usuarios"
    | "categorias"
    | "cursos"
    | "modulos"
    | "aulas"
    | "matriculas"
    | "progressoAulas"
    | "avaliacoes"
    | "trilhas"
    | "trilhasCursos"
    | "certificados"
    | "planos"
    | "assinaturas"
    | "pagamentos";

export type RecordId = number | string;

const idSchema = z.union([z.number(), z.string()]);
const textSchema = z.string();
const numberSchema = z.coerce.number();

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

export class Curso {
    static schema = z.object({
        id: idSchema,
        titulo: textSchema,
        descricao: textSchema,
        nivel: z.enum(["Iniciante", "Intermediário", "Avançado"]),
        idCategoria: numberSchema,
        idInstrutor: numberSchema,
        dataPublicacao: textSchema,
        totalAulas: numberSchema,
        totalHoras: numberSchema
    });

    constructor(
        public id: RecordId,
        public titulo: string,
        public descricao: string,
        public nivel: "Iniciante" | "Intermediário" | "Avançado",
        public idCategoria: number,
        public idInstrutor: number,
        public dataPublicacao: string,
        public totalAulas: number,
        public totalHoras: number
    ) { }
}

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

export class Aula {
    static schema = z.object({
        id: idSchema,
        idModulo: numberSchema,
        titulo: textSchema,
        tipoConteudo: z.enum(["Vídeo", "Texto", "Quiz"]),
        urlConteudo: textSchema,
        duracaoMinutos: numberSchema,
        ordem: numberSchema
    });

    constructor(
        public id: RecordId,
        public idModulo: number,
        public titulo: string,
        public tipoConteudo: "Vídeo" | "Texto" | "Quiz",
        public urlConteudo: string,
        public duracaoMinutos: number,
        public ordem: number
    ) { }
}

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

export class ProgressoAula {
    static schema = z.object({
        id: idSchema,
        idUsuario: numberSchema,
        idAula: numberSchema,
        status: z.enum(["Concluído", "Em andamento"]),
        dataConclusao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: number,
        public idAula: number,
        public status: "Concluído" | "Em andamento",
        public dataConclusao: string
    ) { }
}

export class Avaliacao {
    static schema = z.object({
        id: idSchema,
        idUsuario: numberSchema,
        idCurso: numberSchema,
        nota: numberSchema,
        comentario: textSchema,
        dataAvaliacao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: number,
        public idCurso: number,
        public nota: number,
        public comentario: string,
        public dataAvaliacao: string
    ) { }
}

export class Trilha {
    static schema = z.object({
        id: idSchema,
        titulo: textSchema,
        descricao: textSchema,
        idCategoria: numberSchema
    });

    constructor(
        public id: RecordId,
        public titulo: string,
        public descricao: string,
        public idCategoria: number
    ) { }
}

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

export class Pagamento {
    static schema = z.object({
        id: idSchema,
        idAssinatura: numberSchema,
        valorPago: numberSchema,
        dataPagamento: textSchema,
        metodoPagamento: z.enum(["Cartão", "Pix", "Boleto"]),
        idTransacaoGateway: textSchema
    });

    constructor(
        public id: RecordId,
        public idAssinatura: number,
        public valorPago: number,
        public dataPagamento: string,
        public metodoPagamento: "Cartão" | "Pix" | "Boleto",
        public idTransacaoGateway: string
    ) { }
}

export const modelSchemas = {
    usuarios: Usuario.schema,
    categorias: Categoria.schema,
    cursos: Curso.schema,
    modulos: Modulo.schema,
    aulas: Aula.schema,
    matriculas: Matricula.schema,
    progressoAulas: ProgressoAula.schema,
    avaliacoes: Avaliacao.schema,
    trilhas: Trilha.schema,
    trilhasCursos: TrilhaCurso.schema,
    certificados: Certificado.schema,
    planos: Plano.schema,
    assinaturas: Assinatura.schema,
    pagamentos: Pagamento.schema
};

export interface AppData {
    usuarios: Usuario[];
    categorias: Categoria[];
    cursos: Curso[];
    modulos: Modulo[];
    aulas: Aula[];
    matriculas: Matricula[];
    progressoAulas: ProgressoAula[];
    avaliacoes: Avaliacao[];
    trilhas: Trilha[];
    trilhasCursos: TrilhaCurso[];
    certificados: Certificado[];
    planos: Plano[];
    assinaturas: Assinatura[];
    pagamentos: Pagamento[];
}
