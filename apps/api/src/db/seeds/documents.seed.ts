import { DataSource } from 'typeorm';
import { DocumentEntity } from '../../entities/document.entity';

export async function documentsSeed(dataSource: DataSource): Promise<void> {
  const documentRepo = dataSource.getRepository(DocumentEntity);

  const documents = [
    {
      title: 'Official Application Guidelines 2024',
      url: 'https://example.com/docs/application-guidelines-2024.pdf',
    },
    {
      title: 'Student CV Template',
      url: 'https://example.com/docs/student-cv-template.docx',
    },
    {
      title: 'Internship Evaluation Form',
      url: 'https://example.com/docs/internship-evaluation-form.pdf',
    },
  ];

  for (const doc of documents) {
    const exists = await documentRepo.findOne({
      where: [{ url: doc.url }, { title: doc.title }],
    });
    if (exists) {
      console.log(`ℹ️  Document "${doc.title}" already exists, skipping...`);
      continue;
    }
    const newDoc = documentRepo.create({
      title: doc.title,
      url: doc.url,
    });
    await documentRepo.save(newDoc);
    console.log(`✅ Document "${newDoc.title}" created`);
  }
}
