"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrencyVND } from "@/lib/format";

interface Product {
  id: string;
  title: string;
  price: number;
  group_price: number;
  images: string[];
}

interface Group {
  id: string;
  product_id: string;
  required_count: number;
  current_count: number;
  status: string;
}

export default function CheckoutClient() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const productId = searchParams.get("product_id");
  const groupId = searchParams.get("group_id");
  const type = searchParams.get("type") || "single"; // single or group
  
  const [product, setProduct] = useState<Product | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    async function loadData() {
      if (!productId) {
        router.push("/deals");
        return;
      }

      try {
        // Load product
        const productRes = await fetch("/api/products");
        const products = await productRes.json();
        const foundProduct = products.find((p: Product) => p.id === productId);
        
        if (!foundProduct) {
          alert("Product not found");
          router.push("/deals");
          return;
        }
        
        setProduct(foundProduct);

        // Load group if group purchase
        if (groupId) {
          const groupRes = await fetch("/api/groups");
          const groups = await groupRes.json();
          const foundGroup = groups.find((g: Group) => g.id === groupId);
          setGroup(foundGroup || null);
        }
      } catch (error) {
        console.error("Error loading checkout data:", error);
        alert("Error loading checkout data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId, groupId, router]);

  const getPrice = () => {
    if (!product) return 0;
    return type === "group" ? product.group_price : product.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
    if (!customerInfo.name || !customerInfo.phone) {
      alert("Please fill in your name and phone number");
      return;
    }

    setProcessing(true);

    try {
      const orderData = {
        product_id: productId,
        group_id: groupId || null,
        amount: getPrice(),
        type,
        customer_info: customerInfo,
        payment_method: paymentMethod
      };

      const { authenticatedFetch } = await import("@/lib/apiClient");
      const res = await authenticatedFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData)
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          alert("Please sign in to place an order. Redirecting to profile page...");
          router.push("/profile");
          return;
        }
        throw new Error(result.error || "Failed to create order");
      }

      // Success - show detailed payment instructions
      if (paymentMethod === "bank_transfer") {
        alert(`Order created successfully! Order ID: ${result.order.id}

BANK TRANSFER DETAILS:
Bank: Vietcombank
Account: 1234567890
Name: VN GROUP BUY CO LTD
Amount: ${formatCurrencyVND(getPrice())}
Reference: ${result.order.id}

Please transfer the exact amount and include your order ID (${result.order.id}) in the transfer reference. Your order will be processed after payment confirmation (within 24 hours).`);
      } else {
        alert(`Order created successfully! Order ID: ${result.order.id}`);
      }
      router.push("/orders");
      
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to process order");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-4">{t("checkout.loadingCheckout")}</div>;
  }

  if (!product) {
    return <div className="p-4">{t("checkout.productNotFound")}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t("checkout.orderSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {product.images?.[0] && (
              <img 
                src={product.images[0]} 
                alt={product.title}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-sm text-muted-foreground">
                {type === "group" ? t("checkout.groupPurchase") : t("checkout.singlePurchase")}
              </p>
              {group && (
                <p className="text-xs text-muted-foreground">
                  Group: {group.current_count}/{group.required_count} members
                </p>
              )}
              <p className="font-semibold text-lg mt-1">
                {formatCurrencyVND(getPrice())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("checkout.customerInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">{t("checkout.name")} *</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">{t("checkout.phone")} *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="address">{t("checkout.address")}</Label>
            <Input
              id="address"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label htmlFor="notes">{t("checkout.notes")}</Label>
            <Input
              id="notes"
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special instructions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>{t("checkout.paymentMethod")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <Label htmlFor="bank_transfer">{t("checkout.bankTransfer")}</Label>
            </div>
            <div className="flex items-center space-x-2 opacity-50">
              <RadioGroupItem value="momo" id="momo" disabled />
              <Label htmlFor="momo">MoMo (Coming Soon)</Label>
            </div>
            <div className="flex items-center space-x-2 opacity-50">
              <RadioGroupItem value="zalopay" id="zalopay" disabled />
              <Label htmlFor="zalopay">ZaloPay (Coming Soon)</Label>
            </div>
          </RadioGroup>
          
          {paymentMethod === "bank_transfer" && (
            <div className="mt-4 p-4 bg-muted rounded">
              <p className="font-medium mb-3">{t("checkout.bankTransferDetails")}:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Bank:</span>
                  <span>Vietcombank</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Account Number:</span>
                  <span className="font-mono">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Account Name:</span>
                  <span>VN GROUP BUY CO LTD</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-semibold text-primary">{formatCurrencyVND(getPrice())}</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="font-medium text-yellow-800">Important:</p>
                <p className="text-yellow-700">• Transfer the exact amount shown above</p>
                <p className="text-yellow-700">• Include your order ID in the transfer reference</p>
                <p className="text-yellow-700">• Payment will be confirmed within 24 hours</p>
                <p className="text-yellow-700">• Order will be processed after payment confirmation</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={processing}
      >
        {processing ? t("checkout.processing") : `${t("checkout.placeOrder")} - ${formatCurrencyVND(getPrice())}`}
      </Button>
    </form>
  );
}
