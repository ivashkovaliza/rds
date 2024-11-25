"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const order_1 = require("../order");
const shared_1 = require("../shared");
const models_rules_1 = require("./models-rules");
const services_1 = require("./services");
let CartController = exports.CartController = class CartController {
    constructor(cartService, orderService) {
        this.cartService = cartService;
        this.orderService = orderService;
    }
    findUserCart(req) {
        const cart = this.cartService.findOrCreateByUserId((0, shared_1.getUserIdFromRequest)(req));
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'OK',
            data: { cart, total: (0, models_rules_1.calculateCartTotal)(cart) },
        };
    }
    updateUserCart(req, body) {
        const cart = this.cartService.updateByUserId((0, shared_1.getUserIdFromRequest)(req), body);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'OK',
            data: {
                cart,
                total: (0, models_rules_1.calculateCartTotal)(cart),
            }
        };
    }
    clearUserCart(req) {
        this.cartService.removeByUserId((0, shared_1.getUserIdFromRequest)(req));
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'OK',
        };
    }
    checkout(req, body) {
        const userId = (0, shared_1.getUserIdFromRequest)(req);
        const cart = this.cartService.findByUserId(userId);
        if (!(cart && cart.items.length)) {
            const statusCode = common_1.HttpStatus.BAD_REQUEST;
            req.statusCode = statusCode;
            return {
                statusCode,
                message: 'Cart is empty',
            };
        }
        const { id: cartId, items } = cart;
        const total = (0, models_rules_1.calculateCartTotal)(cart);
        const order = this.orderService.create(Object.assign(Object.assign({}, body), { userId,
            cartId,
            items,
            total }));
        this.cartService.removeByUserId(userId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'OK',
            data: { order }
        };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "findUserCart", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "updateUserCart", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "clearUserCart", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "checkout", null);
exports.CartController = CartController = __decorate([
    (0, common_1.Controller)('api/profile/cart'),
    __metadata("design:paramtypes", [services_1.CartService,
        order_1.OrderService])
], CartController);
//# sourceMappingURL=cart.controller.js.map