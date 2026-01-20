from typing import Optional
from pydantic import BaseModel


class LocaleVariant(BaseModel):
    code: str
    country: str
    flag: str
    is_default: bool = False


class Language(BaseModel):
    code: str
    name: str
    native_name: str
    variants: list[LocaleVariant]


SUPPORTED_LANGUAGES: list[Language] = [
    Language(
        code="fr",
        name="French",
        native_name="Français",
        variants=[
            LocaleVariant(code="fr-FR", country="France", flag="🇫🇷", is_default=True),
            LocaleVariant(code="fr-BE", country="Belgium", flag="🇧🇪"),
            LocaleVariant(code="fr-CH", country="Switzerland", flag="🇨🇭"),
            LocaleVariant(code="fr-CA", country="Canada", flag="🇨🇦"),
        ],
    ),
    Language(
        code="es",
        name="Spanish",
        native_name="Español",
        variants=[
            LocaleVariant(code="es-MX", country="Mexico", flag="🇲🇽", is_default=True),
            LocaleVariant(code="es-ES", country="Spain", flag="🇪🇸"),
            LocaleVariant(code="es-AR", country="Argentina", flag="🇦🇷"),
            LocaleVariant(code="es-CO", country="Colombia", flag="🇨🇴"),
            LocaleVariant(code="es-PE", country="Peru", flag="🇵🇪"),
            LocaleVariant(code="es-CL", country="Chile", flag="🇨🇱"),
        ],
    ),
    Language(
        code="pt",
        name="Portuguese",
        native_name="Português",
        variants=[
            LocaleVariant(code="pt-BR", country="Brazil", flag="🇧🇷", is_default=True),
            LocaleVariant(code="pt-PT", country="Portugal", flag="🇵🇹"),
        ],
    ),
    Language(
        code="de",
        name="German",
        native_name="Deutsch",
        variants=[
            LocaleVariant(code="de-DE", country="Germany", flag="🇩🇪", is_default=True),
            LocaleVariant(code="de-AT", country="Austria", flag="🇦🇹"),
            LocaleVariant(code="de-CH", country="Switzerland", flag="🇨🇭"),
        ],
    ),
    Language(
        code="it",
        name="Italian",
        native_name="Italiano",
        variants=[
            LocaleVariant(code="it-IT", country="Italy", flag="🇮🇹", is_default=True),
            LocaleVariant(code="it-CH", country="Switzerland", flag="🇨🇭"),
        ],
    ),
    Language(
        code="nl",
        name="Dutch",
        native_name="Nederlands",
        variants=[
            LocaleVariant(code="nl-NL", country="Netherlands", flag="🇳🇱", is_default=True),
            LocaleVariant(code="nl-BE", country="Belgium", flag="🇧🇪"),
        ],
    ),
    Language(
        code="pl",
        name="Polish",
        native_name="Polski",
        variants=[
            LocaleVariant(code="pl-PL", country="Poland", flag="🇵🇱", is_default=True),
        ],
    ),
    Language(
        code="sv",
        name="Swedish",
        native_name="Svenska",
        variants=[
            LocaleVariant(code="sv-SE", country="Sweden", flag="🇸🇪", is_default=True),
        ],
    ),
    Language(
        code="da",
        name="Danish",
        native_name="Dansk",
        variants=[
            LocaleVariant(code="da-DK", country="Denmark", flag="🇩🇰", is_default=True),
        ],
    ),
    Language(
        code="nb",
        name="Norwegian",
        native_name="Norsk",
        variants=[
            LocaleVariant(code="nb-NO", country="Norway", flag="🇳🇴", is_default=True),
        ],
    ),
    Language(
        code="fi",
        name="Finnish",
        native_name="Suomi",
        variants=[
            LocaleVariant(code="fi-FI", country="Finland", flag="🇫🇮", is_default=True),
        ],
    ),
    Language(
        code="el",
        name="Greek",
        native_name="Ελληνικά",
        variants=[
            LocaleVariant(code="el-GR", country="Greece", flag="🇬🇷", is_default=True),
        ],
    ),
    Language(
        code="cs",
        name="Czech",
        native_name="Čeština",
        variants=[
            LocaleVariant(code="cs-CZ", country="Czech Republic", flag="🇨🇿", is_default=True),
        ],
    ),
    Language(
        code="ro",
        name="Romanian",
        native_name="Română",
        variants=[
            LocaleVariant(code="ro-RO", country="Romania", flag="🇷🇴", is_default=True),
        ],
    ),
    Language(
        code="hu",
        name="Hungarian",
        native_name="Magyar",
        variants=[
            LocaleVariant(code="hu-HU", country="Hungary", flag="🇭🇺", is_default=True),
        ],
    ),
]

_LANGUAGE_MAP: dict[str, Language] = {lang.code: lang for lang in SUPPORTED_LANGUAGES}
_LOCALE_MAP: dict[str, tuple[Language, LocaleVariant]] = {}
for lang in SUPPORTED_LANGUAGES:
    for variant in lang.variants:
        _LOCALE_MAP[variant.code] = (lang, variant)


def get_language_by_code(code: str) -> Optional[Language]:
    return _LANGUAGE_MAP.get(code)


def get_locale_info(locale_code: str) -> Optional[tuple[Language, LocaleVariant]]:
    return _LOCALE_MAP.get(locale_code)


def get_default_locale_for_language(lang_code: str) -> Optional[str]:
    lang = _LANGUAGE_MAP.get(lang_code)
    if not lang:
        return None
    for variant in lang.variants:
        if variant.is_default:
            return variant.code
    return lang.variants[0].code if lang.variants else None
