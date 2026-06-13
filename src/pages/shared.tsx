import type { ReactNode } from "react";
import type { AppData, Curso, RecordId } from "../models/types";
import { nameById, sameId } from "../utils";

// Monta os dados calculados exibidos na tabela de cursos.
export function courseSummary(data: AppData, course: Curso) {
    const modules = data.modulos.filter((module) => sameId(module.idCurso, course.id));
    const lessons = data.aulas.filter((lesson) => modules.some((module) => sameId(module.id, lesson.idModulo)));
    const minutes = lessons.reduce((total, lesson) => total + lesson.duracaoMinutos, 0);
    return {
        ...course,
        categoriaNome: nameById(data.categorias, course.idCategoria, "nome"),
        instrutorNome: nameById(data.usuarios, course.idInstrutor, "nomeCompleto"),
        totalAulas: lessons.length,
        totalHoras: Number((minutes / 60).toFixed(1))
    };
}

// Texto amigavel para identificar uma assinatura nas telas financeiras.
export function subscriptionDescription(data: AppData, idAssinatura: RecordId) {
    const subscription = data.assinaturas.find((item) => sameId(item.id, idAssinatura));
    if (!subscription) {
        return "-";
    }

    return `${nameById(data.usuarios, subscription.idUsuario, "nomeCompleto")} - ${nameById(data.planos, subscription.idPlano, "nome")}`;
}

export function money(value: number) {
    return `R$ ${Number(value).toFixed(2)}`;
}

// Botao pequeno usado nas acoes das tabelas.
export function ActionButton({ children, danger = false, onClick }: { children: string; danger?: boolean; onClick: () => void }) {
    return <button className={`btn btn-sm btn-${danger ? "outline-danger" : "outline-secondary"}`} type="button" onClick={onClick}>{children}</button>;
}

// Select simples reutilizado em formularios menores.
export function SelectInput({ label, value, options, required, onChange }: {
    label: string;
    value: string;
    options: Array<{ value: string | number; label: string }>;
    required?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="col-12 col-md-6">
            <label className="form-label">{label}</label>
            <select className="form-select" value={value} required={required} onChange={(event) => onChange(event.target.value)}>
                <option value="">Selecione</option>
                {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
        </div>
    );
}

// Input simples reutilizado em formularios menores.
export function TextInput({ label, value, required, type = "text", onChange }: {
    label: string;
    value: string;
    required?: boolean;
    type?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="col-12 col-md-6">
            <label className="form-label">{label}</label>
            <input className="form-control" value={value} required={required} type={type} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

// Tabela simples para listas montadas manualmente.
export function SimpleTable({ columns, rows, emptyText }: { columns: string[]; rows: Array<Array<ReactNode>>; emptyText: string }) {
    return (
        <section className="panel">
            <div className="table-responsive">
                <table className="table align-middle mb-0">
                    <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr><td className="text-center text-muted" colSpan={columns.length}>{emptyText}</td></tr>
                        ) : rows.map((row, index) => (
                            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
