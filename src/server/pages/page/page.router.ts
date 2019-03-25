import { Router } from 'express';
import { DocuemntService } from 'src/server/docuemnts/document/document.service';
import { PageService } from './page.service';

export const pageRouter = Router({ mergeParams: true });

async function getDocuments(widget, docs) {
  if (widget.content) {
    const documentService = new DocuemntService();

    const field = widget.content.field;
    if (field && field.documentId) {
      const id = field.documentId;

      if (!docs.find(doc => doc.id === id)) {
        const search = await documentService.getById(id);
        docs.push(search);
        console.log('getDocument', widget);
      }
    }

    const collection = widget.content.collection;
    if (collection) {
      const collectionDocs = await documentService.getByCollectionId(collection);

      collectionDocs.forEach(colDoc => {
        if (!docs.find(findDoc => findDoc._id === colDoc._id)) {
          docs.push(colDoc);
        }
      });
    }

    const group = widget.content.group;
    if (group) {
      for (let index = 0; index < group.length; index++) {
        const gWidget = group[index];
        await getDocuments(gWidget, docs);
      }
    }
  }
}

// TODO: Refactoring methods
pageRouter.get('', async (req, res, next) => {
  console.log('[GET]/api/pages/', req.params.id);
  const documentService = new DocuemntService();
  const documents = await documentService.getByCollectionId(req.params.id);

  new PageService().getById(req.params.id)
    .then(async (page) => {
      const widgets = page.widgets;
      const docs = [];

      for (let index = 0; index < widgets.length; index++) {
        const widget = widgets[index];
        await getDocuments(widget, docs);
      }

      res.json({
        data: {
          ...page.toObject(),
          data: { documents: docs, collections: [] },
          documents
        },
        success: true,
        message: 'Page was fetched success',
      });
    }).catch(err => next());
});

pageRouter.put('', (req, res, next) => {
  console.log('[PUT]/api/pages/', req.params.id);
  new PageService().update(req.params.id, req.body)
    .then(async (page) => {
      const widgets = page.widgets;
      const docs = [];

      for (let index = 0; index < widgets.length; index++) {
        const widget = widgets[index];
        await getDocuments(widget, docs);
      }

      res.json({
        data: {
          ...page.toObject(),
          data: { documents: docs, collections: [] }
        },
        success: true,
        message: 'Page was updated',
      });
    }).catch(err => next(err));
});
