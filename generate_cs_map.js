const fs = require('fs');

const areas = [
  { id: 'algorithms', label: 'Algorithms', weight: 5, wikiTitle: 'Algorithm', activities: ['Theory'], depends_on: [], influences: ['programming_languages', 'software_engineering'], uvt_notes: [] },
  { id: 'architecture', label: 'Computer Architecture', weight: 4, wikiTitle: 'Computer_architecture', activities: ['Design'], depends_on: [], influences: ['operating_systems', 'computer_engineering'], uvt_notes: [] },
  { id: 'artificial_intelligence', label: 'Artificial Intelligence', weight: 5, wikiTitle: 'Artificial_intelligence', activities: ['Theory', 'Experiment', 'Design'], depends_on: ['algorithms'], influences: ['hci', 'information_systems'], uvt_notes: [] },
  { id: 'computer_engineering', label: 'Computer Engineering', weight: 3, wikiTitle: 'Computer_engineering', activities: ['Design', 'Experiment'], depends_on: ['architecture'], influences: ['embedded_systems'], uvt_notes: [] },
  { id: 'databases', label: 'Databases', weight: 4, wikiTitle: 'Database', activities: ['Design', 'Experiment'], depends_on: ['algorithms'], influences: ['information_systems'], uvt_notes: [] },
  { id: 'graphics', label: 'Computer Graphics', weight: 3, wikiTitle: 'Computer_graphics', activities: ['Design', 'Experiment'], depends_on: ['algorithms'], influences: ['hci'], uvt_notes: [] },
  { id: 'hci', label: 'Human-Computer Interaction', weight: 3, wikiTitle: 'Human%E2%80%93computer_interaction', activities: ['Experiment', 'Design'], depends_on: ['artificial_intelligence'], influences: [], uvt_notes: [] },
  { id: 'information_systems', label: 'Information Systems', weight: 2, wikiTitle: 'Information_system', activities: ['Design', 'Experiment'], depends_on: ['databases'], influences: [], uvt_notes: [] },
  { id: 'networking', label: 'Computer Networking', weight: 4, wikiTitle: 'Computer_network', activities: ['Design', 'Experiment'], depends_on: ['operating_systems'], influences: ['security'], uvt_notes: [] },
  { id: 'operating_systems', label: 'Operating Systems', weight: 4, wikiTitle: 'Operating_system', activities: ['Design', 'Experiment'], depends_on: ['architecture'], influences: ['networking'], uvt_notes: [] },
  { id: 'programming_languages', label: 'Programming Languages', weight: 4, wikiTitle: 'Programming_language', activities: ['Theory', 'Design'], depends_on: ['algorithms'], influences: ['software_engineering'], uvt_notes: [] },
  { id: 'security', label: 'Computer Security', weight: 4, wikiTitle: 'Computer_security', activities: ['Design', 'Experiment'], depends_on: ['networking'], influences: [], uvt_notes: [] },
  { id: 'software_engineering', label: 'Software Engineering', weight: 4, wikiTitle: 'Software_engineering', activities: ['Design', 'Experiment'], depends_on: ['programming_languages'], influences: [], uvt_notes: [] },
  { id: 'theory_of_computation', label: 'Theory of Computation', weight: 5, wikiTitle: 'Theory_of_computation', activities: ['Theory'], depends_on: ['algorithms'], influences: ['programming_languages'], uvt_notes: [] }
];

async function fetchSummary(title) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
  if (!res.ok) throw new Error('Failed fetch');
  return res.json();
}

async function fetchOpenProblems(title) {
  const secRes = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${title}&prop=sections&format=json&origin=*`);
  if (!secRes.ok) return [];
  const secJson = await secRes.json();
  const section = (secJson.parse.sections || []).find(s => /open problems|challenges/i.test(s.line));
  if (!section) return [];
  const htmlRes = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${title}&section=${section.index}&prop=text&format=json&origin=*`);
  if (!htmlRes.ok) return [];
  const htmlJson = await htmlRes.json();
  const html = htmlJson.parse.text['*'];
  const matches = html.match(/<li>(.*?)<\/li>/g) || [];
  return matches.map(m => ({ name: m.replace(/<.*?>/g, '') }));
}

async function build() {
  const results = [];
  for (const area of areas) {
    try {
      const summary = await fetchSummary(area.wikiTitle);
      const problems = await fetchOpenProblems(area.wikiTitle);
      results.push({
        id: area.id,
        label: area.label,
        weight: area.weight,
        activities: area.activities,
        depends_on: area.depends_on,
        influences: area.influences,
        uvt_notes: area.uvt_notes,
        summary: summary.extract,
        image: summary.originalimage ? summary.originalimage.source : null,
        description: summary.description || '',
        problems
      });
    } catch (e) {
      console.error('Error processing', area.id, e);
    }
  }
  fs.writeFileSync('cs_map.json', JSON.stringify(results, null, 2));
}

build();
