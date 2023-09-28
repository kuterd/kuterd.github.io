from datetime import date, datetime
from jinja2 import Environment, FileSystemLoader
from os import path
import markdown
import copy
from translation import LANGUAGES
import subprocess
from urllib import parse as urlparse
from markdown.extensions.toc import TocExtension

SITE_ADDRESS = "https://kuterdinel.com/"

RENDERED_FOLDER = "result"
ENTRIES_FOLDER = "entries"

ACTIVE_LANGUAGES = ["en", "tr"]
DEFAULT_LANGUAGE = "en"

for lang in LANGUAGES:
    LANGUAGES[lang]["code"] = lang

    lang_suffix = ""
    if DEFAULT_LANGUAGE != lang:
        lang_suffix = "-" + lang
    LANGUAGES[lang]["index"] = "index{}.html".format(lang_suffix)
    LANGUAGES[lang]["feed_page"] = "rss{}.xml".format(lang_suffix)


class PageEntry:
    def __init__(self, url, is_hidden=False):
        self.url = url
        self.is_hidden = is_hidden

    @property
    def full_url(self):
        return urlparse.urljoin(SITE_ADDRESS, self.url)


class BlogEntry(PageEntry):
    def __init__(self, title, description, content, date, is_hidden = False, meta_image = None):
        super().__init__(title.lower().replace(" ", "-") + ".html", is_hidden)
        self.meta_image = meta_image
        self.title = title
        self.description = description
        content_file = open(path.join(ENTRIES_FOLDER, content))
        text_content = content_file.read()
        content_file.close()

        self.content = markdown.markdown(
            text_content, extensions=["codehilite", "admonition", "extra", TocExtension(title="Table of Contents")]
        )
        self.rss_date = date.strftime("%a, %d %b %Y %H:%M:%S %z")
        self.date = date.strftime("%d.%m.%Y")
        self.all_languages = [self]
        self.language = DEFAULT_LANGUAGE

def get_git_revision_short_hash():
    return (
        subprocess.check_output(["git", "rev-parse", "--short", "HEAD"])
        .decode("ascii")
        .strip()
    )


blog_version = get_git_revision_short_hash()

file_loader = FileSystemLoader("templates")
env = Environment(loader=file_loader)
env.trim_blocks = True
env.lstrip_blocks = True


def render_page(file_name, template_name, params):
    print("Rendering page: {}".format(file_name))
    params["blog_version"] = blog_version
    params["generation_date"] = datetime.now()
    template = env.get_template(template_name)
    result = template.render(**params)
    rfile = open(path.join(RENDERED_FOLDER, file_name), "w")
    rfile.write(result)


def render_page_multilang(file_name, template_name, params, lang):
    params = copy.copy(params)
    params["languages"] = {x: LANGUAGES[x] for x in ACTIVE_LANGUAGES}
    params["language"] = LANGUAGES[lang]
    params["language_code"] = lang
    params["default_language"] = DEFAULT_LANGUAGE
    params["local"] = LANGUAGES[lang]["localization"]

    render_page(file_name, template_name, params)


def render_all(general, entries):
    all_entries = []
    all_pages = []
    entries_per_lang = {lang: [] for lang in ACTIVE_LANGUAGES}

    # Process entries and set alternative versions.
    for entry in entries:
        # Handle single language blog post entry.
        if isinstance(entry, BlogEntry):
            all_entries.append(entry)
            entry.language = DEFAULT_LANGUAGE
            entries_per_lang[DEFAULT_LANGUAGE].append(entry)
            continue

        all_languages = entry.values()

        # Handle multi language entries.
        for lang in entry:
            entry[lang].language = lang
            entry[lang].all_languages = all_languages
            all_entries.append(entry[lang])
            entries_per_lang[lang].append(entry[lang])

    all_pages = list(all_entries)

    general["active_languages"] = ACTIVE_LANGUAGES
    # Render the index pages and rss feeds for each active language.
    for lang in ACTIVE_LANGUAGES:
        index_info = copy.copy(general)
        index_info["entries"] = entries_per_lang[lang]
        index_info["all_entries"] = all_entries
        all_pages.append(PageEntry(LANGUAGES[lang]["index"]))
        render_page_multilang(LANGUAGES[lang]["index"], "index.html", index_info, lang)
        render_page_multilang(LANGUAGES[lang]["feed_page"], "rss.xml", index_info, lang)

    def render_blog_entry(entry):
        entry_info = copy.copy(general)
        entry_info["entry"] = entry
        render_page_multilang(entry.url, "blog_entry.html", entry_info, entry.language)

    for entry in all_entries:
        render_blog_entry(entry)

    # Render sitemap
    render_page("sitemap.xml", "sitemap.xml", {"pages": all_pages})

    # Render misc.
    render_page_multilang("404.html", "404.html", general, DEFAULT_LANGUAGE)


# ------Add-your-blog-posts-here------
ENTRIES = [
    BlogEntry(
        "Writing a very simple JIT Compiler in about 1000 lines of C",
        "I demonstrate how you can write a simple JIT (Just In Time) compiler for x86 in about 1000 lines of C code.",
        "writing_a_simple_compiler.md",
        date(2023, 8, 28),
        meta_image="/compiler_croped.svg"
    ),
    BlogEntry(
        "V8 Bytecode Reference",
        "List of V8 bytecode instructions, and their documentation/reference.",
        "v8-bytecode-reference.md",
        date(2023, 7, 29),
    ),
    BlogEntry(
        "Joy of programming",
        "Becoming a professional & Joy that programming brings",
        "joy-of-programming.md",
        date(2023, 4, 23),
    ),
    {
        "en": BlogEntry("Hello", "First entry", "hello.md", date(2021, 11, 26)),
        "tr": BlogEntry("Merhaba", "İlk girdi", "hello-tr.md", date(2022, 12, 27)),
    },
]

CONFIG = {
    "author": "Kuter Dinel",
}

render_all(CONFIG, ENTRIES)
