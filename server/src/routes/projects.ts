import { Router } from 'express';
import { requireAuth, requireSystemAdmin } from '../middlewares/auth';
import { requireProjectOwnership } from '../middlewares/guards';
import { getProjects, createProject, updateProject } from '../controllers/projectController';

const router = Router();

router.use(requireAuth);

router.get('/', getProjects);
router.post('/', requireSystemAdmin, createProject);
router.put('/:projectId', requireProjectOwnership, updateProject);

export default router;
