import express from "express";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));

function cleanLatex(text) {
  return text
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\emph\{([^}]*)\}/g, '$1')
    .replace(/\\textit\{([^}]*)\}/g, '$1')
    .replace(/\\texttt\{([^}]*)\}/g, '$1')
    .replace(/\$\|\$/g, '|')
    .replace(/\$\\\cdot\$/g, '•')
    .replace(/\\\\/g, '')
    .replace(/\\[-~]/g, '')
    .replace(/\\/g, '');
}

const resumeData = fs.readFileSync("public/docs/resume.tex", "utf8");

const sections = {};
const sectionRegex = /\\section\{([^}]+)\}([\s\S]*?)(?=\\section\{|\\end\{document\})/g;

for (const match of resumeData.matchAll(sectionRegex)) {
  const sectionName = match[1];
  const sectionContent = match[2].trim();
  sections[sectionName] = sectionContent;
}

// Parse individual projects
const projectsSection = sections['Projects'];
const projects = [];

// Match each project heading and its content
const projectRegex = /\\resumeProjectHeading\s*\{\\textbf\{([^}]+)\}(?:\s*\\href\{[^}]+\}\{[^}]+\})?\s*\$\|\$\s*\\emph\{([^}]+)\}\}\{([^}]+)\}\s*\\resumeItemListStart([\s\S]*?)\\resumeItemListEnd/g;

for (const match of projectsSection.matchAll(projectRegex)) {
  const name = cleanLatex(match[1]);
  const tools = cleanLatex(match[2]);
  const date = cleanLatex(match[3]);
  const itemsText = match[4];
  
  // Extract individual description items
  const descriptionItems = [];
  const itemRegex = /\\resumeItem\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  for (const itemMatch of itemsText.matchAll(itemRegex)) {
    descriptionItems.push(cleanLatex(itemMatch[1]));
  }
  
  projects.push({
    name,
    tools,
    date,
    description: descriptionItems
  });
}

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/projects", (req, res) => {
    res.render("projects.ejs", { projects });
});

app.get("/resume", (req, res) => {
    res.render("resume.ejs");
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});