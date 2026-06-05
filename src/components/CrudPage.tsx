import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useState } from "react";

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface FieldConfig<TForm extends Record<string, string>> {
    name: keyof TForm & string;
    label: string;
    type?: "text" | "email" | "password" | "date" | "number" | "select" | "textarea" | "url";
    required?: boolean;
    min?: number;
    step?: string;
    col?: string;
    options?: SelectOption[];
}

export interface ColumnConfig<TRow> {
    key: string;
    label: string;
    render?: (row: TRow) => ReactNode;
}

interface CrudPageProps<TForm extends Record<string, string>, TRow extends object> {
    title: string;
    description: string;
    initialValues: TForm;
    fields: FieldConfig<TForm>[];
    columns: ColumnConfig<TRow>[];
    rows: TRow[];
    emptyText: string;
    onSubmit: (form: TForm) => boolean | void;
    renderActions?: (row: TRow) => ReactNode;
    getRowKey?: (row: TRow) => string | number;
}

export function CrudPage<TForm extends Record<string, string>, TRow extends object>({
    title,
    description,
    initialValues,
    fields,
    columns,
    rows,
    emptyText,
    onSubmit,
    renderActions,
    getRowKey
}: CrudPageProps<TForm, TRow>) {
    const [form, setForm] = useState<TForm>(initialValues);

    function change(name: keyof TForm & string, value: string) {
        setForm((current) => ({ ...current, [name]: value }));
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const saved = onSubmit(form);
        if (saved !== false) {
            setForm(initialValues);
        }
    }

    return (
        <>
            <section className="panel">
                <h1 className="h3 mb-2">{title}</h1>
                <p className="text-muted mb-0">{description}</p>
            </section>
            <section className="panel">
                <form className="row g-3" onSubmit={submit}>
                    {fields.map((field) => (
                        <FormField field={field} value={form[field.name] ?? ""} onChange={change} key={field.name} />
                    ))}
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">Salvar</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => setForm(initialValues)}>Limpar</button>
                    </div>
                </form>
            </section>
            <DataTable columns={columns} rows={rows} emptyText={emptyText} renderActions={renderActions} getRowKey={getRowKey} />
        </>
    );
}

function FormField<TForm extends Record<string, string>>({ field, value, onChange }: {
    field: FieldConfig<TForm>;
    value: string;
    onChange: (name: keyof TForm & string, value: string) => void;
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
            <label className="form-label" htmlFor={field.name}>{field.label}</label>
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

function DataTable<TRow extends object>({ columns, rows, emptyText, renderActions, getRowKey }: {
    columns: ColumnConfig<TRow>[];
    rows: TRow[];
    emptyText: string;
    renderActions?: (row: TRow) => ReactNode;
    getRowKey?: (row: TRow) => string | number;
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
