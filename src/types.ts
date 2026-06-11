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

export interface Usuario {
    id: RecordId;
    nomeCompleto: string;
    email: string;
    senha: string;
    dataCadastro: string;
    tipoUsuario: "Aluno" | "Instrutor";
}

export interface Categoria {
    id: RecordId;
    nome: string;
    descricao: string;
}

export interface Curso {
    id: RecordId;
    titulo: string;
    descricao: string;
    nivel: "Iniciante" | "Intermediário" | "Avançado";
    idCategoria: number;
    idInstrutor: number;
    dataPublicacao: string;
    totalAulas: number;
    totalHoras: number;
}

export interface Modulo {
    id: RecordId;
    idCurso: number;
    titulo: string;
    ordem: number;
}

export interface Aula {
    id: RecordId;
    idModulo: number;
    titulo: string;
    tipoConteudo: "Vídeo" | "Texto" | "Quiz";
    urlConteudo: string;
    duracaoMinutos: number;
    ordem: number;
}

export interface Matricula {
    id: RecordId;
    idUsuario: number;
    idCurso: number;
    dataMatricula: string;
    dataConclusao: string | null;
}

export interface ProgressoAula {
    id: RecordId;
    idUsuario: number;
    idAula: number;
    status: "Concluído" | "Em andamento";
    dataConclusao: string;
}

export interface Avaliacao {
    id: RecordId;
    idUsuario: number;
    idCurso: number;
    nota: number;
    comentario: string;
    dataAvaliacao: string;
}

export interface Trilha {
    id: RecordId;
    titulo: string;
    descricao: string;
    idCategoria: number;
}

export interface TrilhaCurso {
    id: RecordId;
    idTrilha: number;
    idCurso: number;
    ordem: number;
}

export interface Certificado {
    id: RecordId;
    idUsuario: number;
    idCurso: number;
    idTrilha: number | null;
    codigoVerificacao: string;
    dataEmissao: string;
}

export interface Plano {
    id: RecordId;
    nome: string;
    descricao: string;
    preco: number;
    duracaoMeses: number;
}

export interface Assinatura {
    id: RecordId;
    idUsuario: number;
    idPlano: number;
    dataInicio: string;
    dataFim: string;
}

export interface Pagamento {
    id: RecordId;
    idAssinatura: number;
    valorPago: number;
    dataPagamento: string;
    metodoPagamento: "Cartão" | "Pix" | "Boleto";
    idTransacaoGateway: string;
}

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
