import {app} from '../server/app.mjs';
export const GET=request=>app.fetch(request);
export const POST=request=>app.fetch(request);
export const PUT=request=>app.fetch(request);
export const DELETE=request=>app.fetch(request);
export const OPTIONS=request=>app.fetch(request);
