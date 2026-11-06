import { Router } from 'express';
import { authRouter } from './auth.routes';
import { categoryRouter } from './category.routes';
import { productRouter } from './product.routes';
import { uploadRouter } from './upload.routes';
import { orderRouter } from './order.routes';
import { couponRouter } from './coupon.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/uploads', uploadRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/coupons', couponRouter);
