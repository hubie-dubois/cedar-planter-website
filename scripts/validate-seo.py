"""Dependency-free checks for this GitHub Pages site's SEO and local links."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://paxtonplanters.com'

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.tags, self.ids, self.graphs = path, [], [], []
        self.in_json = False
        self.json_text = ''
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.in_json = True
            self.json_text = ''
    def handle_data(self, data):
        if self.in_json:
            self.json_text += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.in_json:
            self.graphs.append(json.loads(self.json_text))
            self.in_json = False
    def select(self, tag, **attrs):
        return [a for t, a in self.tags if t == tag and all(a.get(k) == v for k, v in attrs.items())]

pages = [Page(ROOT / 'index.html'), Page(ROOT / 'confirmation/index.html')]
titles, descriptions = set(), set()
for page in pages:
    source = page.path.read_text()
    assert 'planters.hubiedubois.com' not in source
    assert len(page.select('h1')) == 1
    assert len(page.ids) == len(set(page.ids)), 'Duplicate IDs'
    assert len(page.select('title')) == 1
    title = source.split('<title>')[1].split('</title>')[0]
    desc = page.select('meta', name='description')[0]['content']
    assert title not in titles and desc not in descriptions
    titles.add(title); descriptions.add(desc)
    canonical = page.select('link', rel='canonical')
    expected = ORIGIN + ('/' if page.path.parent == ROOT else '/confirmation/')
    assert len(canonical) == 1 and canonical[0]['href'] == expected
    for tag, attrs in page.tags:
        urls = [attrs[k] for k in ('src', 'href') if k in attrs]
        urls += [part.strip().split()[0] for part in attrs.get('srcset', '').split(',') if part.strip()]
        for url in urls:
            parsed = urlparse(url)
            if parsed.scheme and (parsed.scheme != 'https' or parsed.netloc != 'paxtonplanters.com'):
                continue
            target = ROOT / unquote(parsed.path.lstrip('/')) if parsed.netloc or parsed.path.startswith('/') else page.path.parent / unquote(parsed.path)
            if not parsed.path:
                target = page.path
            if target.is_dir():
                target /= 'index.html'
            assert target.exists(), f'{page.path.name}: missing {url}'
            if parsed.fragment and target.suffix == '.html':
                assert parsed.fragment in Page(target).ids, f'Missing anchor: {url}'
        if tag == 'img':
            assert attrs.get('alt') and int(attrs['width']) > 0 and int(attrs['height']) > 0
            if attrs.get('class') == 'hero-image':
                assert attrs.get('fetchpriority') == 'high' and attrs.get('loading') != 'lazy'
            else:
                assert attrs.get('loading') == 'lazy'
    print('PASS metadata, headings, local assets, links, image attributes:', page.path.relative_to(ROOT))

home = pages[0]
business, product, faq = home.graphs[0]['@graph']
assert business['@type'] == 'LocalBusiness'
assert business['address'] == {'@type':'PostalAddress', 'addressLocality':'Paxton', 'addressRegion':'IL', 'addressCountry':'US'}
assert not ({'geo','telephone','openingHours','review','aggregateRating'} & business.keys())
assert product['@type'] == 'Product' and product['name'] == 'Classic Cedar Planter Box'
assert product['offers']['price'] == '95' and product['offers']['priceCurrency'] == 'USD'
assert 'availability' not in product['offers']
assert business['makesOffer']['@id'] == product['offers']['@id']
assert '9500' == home.select('p', id='unit-price')[0]['data-price-cents']
for question in faq['mainEntity']:
    assert question['name'] in home.path.read_text()
    assert question['acceptedAnswer']['text'] in home.path.read_text()
assert 'noindex' in pages[1].select('meta', name='robots')[0]['content']
assert 'noindex' not in home.select('meta', name='robots')[0]['content']
sitemap = ET.parse(ROOT / 'sitemap.xml')
locations = [e.text for e in sitemap.findall('.//{*}loc')]
assert locations == [ORIGIN + '/'], 'Only homepage is indexable product content'
assert not sitemap.findall('.//{*}lastmod'), 'Do not invent modification dates'
assert (ROOT / 'robots.txt').read_text() == f'User-agent: *\nAllow: /\n\nSitemap: {ORIGIN}/sitemap.xml\n'
assert (ROOT / 'CNAME').read_text().strip() == 'paxtonplanters.com'
assert (ROOT / 'google3bd85db43eab4e14.html').read_text().strip() == 'google-site-verification: google3bd85db43eab4e14.html'
print('PASS JSON-LD syntax and content, sitemap, robots, CNAME, verification file')
print('These checks do not certify Google rich-result eligibility or live deployment.')
