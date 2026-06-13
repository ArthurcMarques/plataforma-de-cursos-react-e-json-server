// Cabecalho padrao usado no topo das paginas.
interface PageHeaderProps {
    title: string;
    description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <section className="panel">
            <h1 className="h3 mb-2">{title}</h1>
            <p className="text-muted mb-0">{description}</p>
        </section>
    );
}
