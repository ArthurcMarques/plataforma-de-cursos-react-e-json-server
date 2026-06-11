import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useState } from "react";

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface FieldConfig {
    name: string;
    label: string;
    type?: "text" | "email" | "password" | "date" | "number" | "select" | "textarea" | "url";
    required?: boolean;
    min?: number;
    step?: string;
    col?: string;
    options?: SelectOption[];
    actionLabel?: string;
    onAction?: () => void;
}

export interface ColumnConfig {
    key: string;
    label: string;
    render?: (row: any) => ReactNode;
}

type FormValues = Record<string, string>;

interface CrudPageProps {
    title: string;
    description: string;
    initialValues: FormValues;
    fields: FieldConfig[];
    columns: ColumnConfig[];
    rows: any[];
    emptyText: string;
    onSubmit: (form: FormValues) => boolean | void | Promise<boolean | void>;
    getEditValues?: (row: any) => FormValues;
    onUpdate?: (row: any, form: FormValues) => boolean | void | Promise<boolean | void>;
    renderActions?: (row: any) => ReactNode;
    getRowKey?: (row: any) => string | number;
}

// Componente generico para telas de cadastro, edicao e listagem.
export function CrudPage({
    title,
    description,
    initialValues,
    fields,
    columns,
    rows,
    emptyText,
    onSubmit,
    getEditValues,
    onUpdate,
    renderActions,
    getRowKey
}: CrudPageProps) {
    const [form, setForm] = useState<FormValues>(initialValues);
    const [editingRow, setEditingRow] = useState<any | null>(null);

    function change(name: string, value: string) {
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const saved = editingRow && onUpdate ? await onUpdate(editingRow, form) : await onSubmit(form);
        if (saved !== false) {
            resetForm();
        }
    }

    function startEdit(row: any) {
        if (!getEditValues) {
            return;
        }

        setEditingRow(row);
        setForm(getEditValues(row));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetForm() {
        setEditingRow(null);
        setForm(initialValues);
    }

    function renderRowActions(row: any) {
        const customActions = renderActions ? renderActions(row) : null;
        if (!getEditValues || !onUpdate) {
            return customActions;
        }

        return (
            <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => startEdit(row)}>Editar</button>
                {customActions}
            </div>
        );
    }

    return (
        <>
            <section className="panel">
                <h1 className="h3 mb-2">{title}</h1>
                <p className="text-muted mb-0">{description}</p>
            </section>
            <section className="panel">
                {editingRow && <p className="edit-banner">Editando registro. Salve as alterações ou limpe o formulário para cancelar.</p>}
                <form className="row g-3" onSubmit={submit}>
                    {fields.map((field) => (
                        <FormField field={field} value={form[field.name] ?? ""} onChange={change} key={field.name} />
                    ))}
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingRow ? "Salvar alterações" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>{editingRow ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <DataTable columns={columns} rows={rows} emptyText={emptyText} renderActions={renderRowActions} getRowKey={getRowKey} />
        </>
    );
}

function FormField({ field, value, onChange }: {
    field: FieldConfig;
    value: string;
    onChange: (name: string, value: string) => void;
}) {
    const commonProps = {
        id: field.name,
        value,
        required: field.required,
        min: field.min,
        step: field.step,
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(field.name, event.target.value)
    };

    return (
        <div className={field.col ?? "col-12 col-md-6"}>
            <div className="field-heading">
                <label className="form-label mb-0" htmlFor={field.name}>{field.label}</label>
                {field.onAction && field.actionLabel && (
                    <button className="btn btn-sm btn-outline-primary" type="button" onClick={field.onAction}>
                        {field.actionLabel}
                    </button>
                )}
            </div>
            {field.type === "select" ? (
                <select {...commonProps} className="form-select">
                    <option value="">Selecione</option>
                    {(field.options ?? []).map((option) => (
                        <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                </select>
            ) : field.type === "textarea" ? (
                <textarea {...commonProps} className="form-control" rows={3} />
            ) : (
                <input {...commonProps} className="form-control" type={field.type ?? "text"} />
            )}
        </div>
    );
}

function DataTable({ columns, rows, emptyText, renderActions, getRowKey }: {
    columns: ColumnConfig[];
    rows: any[];
    emptyText: string;
    renderActions?: (row: any) => ReactNode;
    getRowKey?: (row: any) => string | number;
}) {
    return (
        <section className="panel">
            <div className="table-responsive">
                <table className="table align-middle mb-0">
                    <thead>
                        <tr>
                            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                            {renderActions && <th className="text-center">Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td className="text-center text-muted" colSpan={columns.length + (renderActions ? 1 : 0)}>{emptyText}</td>
                            </tr>
                        ) : rows.map((row, index) => (
                            <tr key={getRowKey ? getRowKey(row) : String((row as { id?: unknown }).id ?? index)}>
                                {columns.map((column) => (
                                    <td key={column.key}>{column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "-")}</td>
                                ))}
                                {renderActions && <td className="text-center">{renderActions(row)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
