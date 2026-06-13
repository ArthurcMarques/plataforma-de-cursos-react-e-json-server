// Tipos e schemas reutilizados pelos models.
import { z } from "zod";

export type RecordId = number | string;

export const idSchema = z.union([z.number(), z.string()]);
export const textSchema = z.string();
export const numberSchema = z.coerce.number();

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
