import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body); // saveParse => يعني يحاول التحقق من صحة البيانات ويعيد النتيجة سواء كانت صحيحة أو خاطئة

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message
                })),
            });
        }
        req.body = result.data; // إذا كانت البيانات صحيحة، يتم تحديث req.body بالبيانات الصحيحة
        next();
    };
};

export default validate;