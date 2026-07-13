import re
import textwrap
from app.schemas import ChatRequest


def _keywords(message: str) -> set[str]:
    clean = re.sub(r"[^\wà-úÀ-Ú\s]", " ", message.lower())
    return set(clean.split())


def _first_lines(text: str, n: int = 3) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    return [p.strip() for p in parts if p.strip()][:n]


def _wants(message_kw: set[str], *terms: str) -> bool:
    return any(term in message_kw for term in terms)


def generate_reply(payload: ChatRequest) -> str:
    kw = _keywords(payload.message)
    has_seed = bool(payload.seed_content)
    memory = "\n".join(f"💭 {h}" for h in payload.memory_hints) if payload.memory_hints else ""

    if not has_seed:
        base = (
            "Estou aqui para ajudar a desenvolver suas ideias. Abra uma Seed específica "
            "para eu conhecer o conteúdo dela, ou me conte em poucas palavras o que você "
            "está pensando."
        )
        return f"{base}\n\n{memory}".strip()

    title = payload.seed_title or "sua Seed"
    content = payload.seed_content or ""

    if _wants(kw, "checklist", "tarefas", "passos", "etapas"):
        reply = _build_checklist(title, content)
    elif _wants(kw, "plano", "planejamento", "cronograma", "roadmap"):
        reply = _build_plan(title, content)
    elif _wants(kw, "resuma", "resumo", "resumir", "resume"):
        reply = _build_summary(title, content)
    elif _wants(kw, "projeto", "transforme", "transformar"):
        reply = _build_transform(title, content, "PROJETO")
    elif _wants(kw, "livro"):
        reply = _build_transform(title, content, "LIVRO")
    elif _wants(kw, "artigo"):
        reply = _build_transform(title, content, "ARTIGO")
    elif _wants(kw, "melhore", "melhorar", "melhoria", "aprimore"):
        reply = _build_improvement(title, content)
    elif _wants(kw, "parada", "parado", "abandonei", "esqueci"):
        reply = _build_status_check(title, payload.seed_status)
    elif _wants(kw, "pergunta", "perguntas", "duvida", "dúvida"):
        reply = _build_questions(title, content)
    else:
        reply = _build_generic(title, content, payload.message)

    if memory:
        reply = f"{reply}\n\n{memory}"

    return reply


def _build_checklist(title: str, content: str) -> str:
    lines = _first_lines(content, 4) or ["Definir o próximo passo"]
    items = "\n".join(f"☐ {textwrap.shorten(l, width=90)}" for l in lines)
    return (
        f'Aqui está um checklist inicial para "{title}", a partir do que você já escreveu:\n\n'
        f"{items}\n☐ Revisar e ajustar as etapas acima\n☐ Definir um prazo realista\n\n"
        "Quer que eu detalhe alguma dessas etapas ou adicione outra?"
    )


def _build_plan(title: str, content: str) -> str:
    return (
        f'Sugestão de plano para "{title}":\n\n'
        "1. Clarear o objetivo principal — o que significa 'concluído' aqui?\n"
        "2. Levantar o que já existe (o conteúdo atual da Seed já é um bom começo)\n"
        "3. Quebrar em etapas pequenas e sequenciais\n"
        "4. Definir um prazo para a primeira etapa\n"
        "5. Revisar semanalmente o progresso\n\n"
        "Me diga qual dessas etapas você quer aprofundar primeiro."
    )


def _build_summary(title: str, content: str) -> str:
    lines = _first_lines(content, 3)
    summary = " ".join(lines) if lines else content[:200]
    return f'Resumo de "{title}":\n\n{textwrap.shorten(summary, width=280, placeholder="...")}'


def _build_transform(title: str, content: str, target: str) -> str:
    label = {
        "PROJETO": "projeto",
        "LIVRO": "livro",
        "ARTIGO": "artigo",
    }.get(target, target.lower())
    return (
        f'Podemos transformar "{title}" em um {label}. Use o seletor de tipo acima para '
        f"marcar essa Seed como {label} — o histórico de evolução é preservado.\n\n"
        f"Para começar, pense em: qual é a mensagem central que você quer transmitir com este {label}? "
        "Se quiser, me diga e eu ajudo a estruturar os próximos passos."
    )


def _build_improvement(title: str, content: str) -> str:
    questions = [
        "O que motivou você a escrever isso?",
        "Quem mais se beneficiaria dessa ideia?",
        "O que falta para ela sair do papel?",
    ]
    q = "\n".join(f"• {q}" for q in questions)
    return (
        f'Para melhorar "{title}", algumas perguntas que costumam ajudar a lapidar uma ideia:\n\n{q}\n\n'
        "Responda a que fizer mais sentido e eu ajudo a evoluir o texto."
    )


def _build_status_check(title: str, status: str | None) -> str:
    status_label = {
        "SEMENTE": "ainda é uma semente",
        "CRESCENDO": "está crescendo",
        "PROJETO": "já é um projeto",
        "COLHIDA": "já foi colhida",
    }.get(status or "", "está registrada")
    return (
        f'"{title}" {status_label}. Se ela está parada, pode ser hora de dar um pequeno passo: '
        "escrever mais uma frase, criar um checklist ou simplesmente decidir se ainda faz sentido para você. "
        "Nenhuma ideia precisa evoluir sozinha — eu só ajudo a lembrar."
    )


def _build_questions(title: str, content: str) -> str:
    return (
        f'Sobre "{title}", algumas perguntas para desenvolver a ideia:\n\n'
        "• Qual problema real ela resolve?\n"
        "• O que já está pronto e o que ainda falta?\n"
        "• Qual seria o menor passo possível para avançar hoje?"
    )


def _build_generic(title: str, content: str, message: str) -> str:
    return (
        f'Sobre "{title}": recebi sua mensagem — "{message.strip()}".\n\n'
        "Posso ajudar a criar um checklist, montar um plano, resumir, sugerir melhorias ou "
        "transformar essa Seed em projeto/artigo/livro. É só pedir."
    )