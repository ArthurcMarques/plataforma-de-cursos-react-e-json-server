// Arquivo central dos models.
// Exporta as classes, junta os schemas e define o formato geral dos dados.
export type { CollectionName, RecordId } from "./common";
export { Usuario } from "./Usuario";
export { Categoria } from "./Categoria";
export { Curso } from "./Curso";
export { Modulo } from "./Modulo";
export { Aula } from "./Aula";
export { Matricula } from "./Matricula";
export { ProgressoAula } from "./ProgressoAula";
export { Avaliacao } from "./Avaliacao";
export { Trilha } from "./Trilha";
export { TrilhaCurso } from "./TrilhaCurso";
export { Certificado } from "./Certificado";
export { Plano } from "./Plano";
export { Assinatura } from "./Assinatura";
export { Pagamento } from "./Pagamento";

import { Assinatura } from "./Assinatura";
import { Aula } from "./Aula";
import { Avaliacao } from "./Avaliacao";
import { Categoria } from "./Categoria";
import { Certificado } from "./Certificado";
import { Curso } from "./Curso";
import { Matricula } from "./Matricula";
import { Modulo } from "./Modulo";
import { Pagamento } from "./Pagamento";
import { Plano } from "./Plano";
import { ProgressoAula } from "./ProgressoAula";
import { Trilha } from "./Trilha";
import { TrilhaCurso } from "./TrilhaCurso";
import { Usuario } from "./Usuario";

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

// Estrutura completa carregada do JSON Server.
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
