import { contentResponse } from 'helpers';
import pkg from '../../../../package.json';

const { version } = pkg;

export function GET() {
  return Response.json(contentResponse('ok', { version }));
}
