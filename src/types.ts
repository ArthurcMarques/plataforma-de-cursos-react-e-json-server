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

export interface Usuario {
    id: number;
    nomeCompleto: string;
    email: string;
    senha: string;
    dataCadastro: string;
    tipoUsuario: "Aluno" | "Instrutor";
}

export interface Categoria {
    id: number;
    nome: string;
    descricao: string;
}

export interface Curso {
    id: number;
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
    id: number;
    idCurso: number;
    titulo: string;
    ordem: number;
}

export interface Aula {
    id: number;
    idModulo: number;
    titulo: string;
    tipoConteudo: "Vídeo" | "Texto" | "Quiz";
    urlConteudo: string;
    duracaoMinutos: number;
    ordem: number;
}

export interface Matricula {
    id: number;
    idUsuario: number;
    idCurso: number;
    dataMatricula: string;
    dataConclusao: string | null;
}

export interface ProgressoAula {
    id: number;
    idUsuario: number;
    idAula: number;
    status: "Concluído" | "Em andamento";
    dataConclusao: string;
}

export interface Avaliacao {
    id: number;
    idUsuario: number;
    idCurso: number;
    nota: number;
    comentario: string;
    dataAvaliacao: string;
}

export interface Trilha {
    id: number;
    titulo: string;
    descricao: string;
    idCategoria: number;
}

export interface TrilhaCurso {
    id: number;
    idTrilha: number;
    idCurso: number;
    ordem: number;
}

export interface Certificado {
    id: number;
    idUsuario: number;
    idCurso: number;
    idTrilha: number | null;
    codigoVerificacao: string;
    dataEmissao: string;
}

export interface Plano {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    duracaoMeses: number;
}

export interface Assinatura {
    id: number;
    idUsuario: number;
    idPlano: number;
    dataInicio: string;
    dataFim: string;
}

export interface Pagamento {
    id: number;
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
