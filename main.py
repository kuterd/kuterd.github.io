from datetime import date
from jinja2 import Environment, FileSystemLoader
from os import path
import markdown
import copy
from translation import LANGUAGES

RENDERED_FOLDER = "result"
ENTRIES_FOLDER = "entries"

ACTIVE_LANGUAGES = ["en", "tr"]

# Language configuration
DEFAULT_LANGUAGE = "en"

class BlogEntry:
    def __init__(self, title, description, content, date):
        self.title = title
        self.description = description

        content_file = open(path.join(ENTRIES_FOLDER, content))
        self.content = markdown.markdown(content_file.read(), extensions=['codehilite','fenced_code'])
        self.date = date.strftime("%d-%m-%Y")
        self.url = title.lower().replace(' ', '-') + ".html"
        self.all_languages = [self]
        self.language = DEFAULT_LANGUAGE


file_loader = FileSystemLoader("templates")
env = Environment(loader=file_loader)

def render_page(file_name, tmp_name, params):
    print("Rendering page: {}".format(file_name))
    template = env.get_template(tmp_name)
    result = template.render(**params)
    rfile = open(path.join(RENDERED_FOLDER, file_name), "w")
    rfile.write(result)

def render_page_multilang(file_name, tmp_name, params, lang):
    params = copy.copy(params)
    params["languages"] = {x: LANGUAGES[x] for x in ACTIVE_LANGUAGES}
    params["language"] = LANGUAGES[lang]
    params["language_code"] = lang
    params["local"] = LANGUAGES[lang]["localization"]

    render_page(file_name, tmp_name, params)

def render_all(general, entries):
    all_entries = []
    entries_per_lang = {lang: [] for lang in ACTIVE_LANGUAGES}

    # Process entries and set alternative versions.
    for entry in entries:
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


    general["active_languages"] = ACTIVE_LANGUAGES
    # Render the index pages for each active language.
    for lang in ACTIVE_LANGUAGES:
        index_info = copy.copy(general)
        index_info["entries"] = entries_per_lang[lang]
        index_info["all_entries"] = all_entries
        render_page_multilang(LANGUAGES[lang]["index"], "index.html", index_info, lang)

    def render_blog_entry(entry):
        entry_info = copy.copy(general)
        entry_info["entry"] = entry
        render_page_multilang(entry.url, "blog_entry.html", entry_info, entry.language)

    for entry in all_entries:
        render_blog_entry(entry)

def process_languages():
    for lang in LANGUAGES:
        LANGUAGES[lang]["code"] = lang

        index_suffix = ""
        if DEFAULT_LANGUAGE != lang:
            index_suffix = "-" + lang
        LANGUAGES[lang]["index"] = "index{}.html".format(index_suffix)
process_languages()


# ------Add-your-blog-posts-here------

entries = [
    {"en": BlogEntry("Making a very simple static blog generator", "This is a description", "test.md", date.today()),
     "tr": BlogEntry("Basic bir static blog oluşturucusu yapmak", "Bu bir açıklama", "test-tr.md", date.today())},
    BlogEntry("A entry without description", "", "test.md", date.today()),
    BlogEntry("Lorem ipsum", "Very descriptive", "lorem-ipsum.md", date.today()),
    BlogEntry("Code highlight test", "Testing if we can highlight code in markdown", "code_test.md", date.today())
]


# Replace your name here.
render_all({"author": "Replace Me"}, entries)


