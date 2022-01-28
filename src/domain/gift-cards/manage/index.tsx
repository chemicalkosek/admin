import {
  useAdminProduct,
  useAdminProductTypes,
  useAdminStore,
} from "medusa-react"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import PlusIcon from "../../../components/fundamentals/icons/plus-icon"
import TrashIcon from "../../../components/fundamentals/icons/trash-icon"
import UnpublishIcon from "../../../components/fundamentals/icons/unpublish-icon"
import StatusIndicator from "../../../components/fundamentals/status-indicator"
import BreadCrumb from "../../../components/molecules/breadcrumb"
import Input from "../../../components/molecules/input"
import Select from "../../../components/molecules/select"
import TagInput from "../../../components/molecules/tag-input"
import BodyCard from "../../../components/organisms/body-card"
import DetailsCollapsible from "../../../components/organisms/details-collapsible"
import DenominationTable from "./denomination-table"

type ManageGiftCardProps = {
  path: string
  id: string
  updateGiftCard: (data) => void
  deleteGiftCard: () => void
}

const ManageGiftCard: React.FC<ManageGiftCardProps> = ({
  id,
  updateGiftCard,
  deleteGiftCard,
}: ManageGiftCardProps) => {
  const { store } = useAdminStore()
  const { product: giftCard, isSuccess } = useAdminProduct(id)
  const { types } = useAdminProductTypes()

  const { register, handleSubmit, reset } = useForm()

  const [type, setType] = useState<{ label: string; value: string } | null>(
    giftCard?.type
      ? { value: giftCard?.type.value, label: giftCard?.type.value }
      : null
  )
  const [tags, setTags] = useState<string[]>(
    giftCard?.tags?.map((t) => t.value) || []
  )

  register("title")
  register("subtitle")
  register("description")

  const submit = (data) => {
    const update = { ...data }

    if (typeof type === `undefined`) {
      // if undefined, assume you are removing
      update.type = null
    } else {
      update.type = {
        value: type.value,
      }
    }

    if (tags?.length) {
      update.tags = tags.map((t) => ({ value: t }))
    }

    updateGiftCard(update)
  }

  useEffect(() => {
    if (!isSuccess) {
      return
    }

    reset({
      ...giftCard,
    })
  }, [giftCard, isSuccess, reset])

  useEffect(() => {
    if (giftCard?.type) {
      setType({ value: giftCard.type.value, label: giftCard.type.value })
    }
  }, [giftCard])

  const StatusComponent = () => {
    switch (giftCard?.status) {
      case "published":
        return <StatusIndicator title="Published" variant="success" />
      case "draft":
        return <StatusIndicator title="Draft" variant="primary" />
      case "proposed":
        return <StatusIndicator title="Proposed" variant="warning" />
      case "rejected":
        return <StatusIndicator title="Rejected" variant="danger" />
      default:
        return null
    }
  }

  return (
    <div>
      <BreadCrumb
        currentPage={"Manage Gift Card"}
        previousBreadcrumb={"Gift Cards"}
        previousRoute="/a/gift-cards"
      />
      <form className="flex flex-col space-y-4">
        <BodyCard
          title="Product information"
          subtitle="Manage the settings for your Gift Card"
          className={"h-auto w-full"}
          status={<StatusComponent />}
          actionables={[
            {
              label:
                giftCard?.status !== "published"
                  ? "Publish Gift Card"
                  : "Unpublish Gift Card",
              onClick: () => {
                if (giftCard?.status === "published") {
                  submit({ status: "draft" })
                } else {
                  submit({ status: "published" })
                }
              },
              icon: <UnpublishIcon size="16" />,
            },
            {
              label: "Delete Gift Card",
              onClick: () => deleteGiftCard(),
              variant: "danger",
              icon: <TrashIcon size="16" />,
            },
          ]}
          events={[
            {
              label: "Save",
              type: "button",
              onClick: handleSubmit(submit),
            },
          ]}
        >
          <div className="flex flex-col space-y-6">
            <div className="flex space-x-8">
              <div className="flex flex-col w-1/2 space-y-4">
                <Input
                  label="Name"
                  name="title"
                  defaultValue={giftCard?.title}
                  ref={register}
                />
                <Input
                  label="Subtitle"
                  name="subtitle"
                  placeholder="Add a subtitle"
                  defaultValue={giftCard?.subtitle}
                  ref={register}
                />
              </div>
              <Input
                label="Description"
                name="description"
                placeholder="Add a description"
                defaultValue={giftCard?.description}
                className="w-1/2"
                ref={register}
              />
            </div>
            <DetailsCollapsible triggerProps={{ className: "ml-2" }}>
              <div className="flex space-x-8">
                <div className="flex flex-col w-1/2 space-y-4">
                  <Input
                    label="Handle"
                    name="handle"
                    defaultValue={giftCard?.handle}
                    ref={register}
                    tooltipContent="URL of the product"
                  />
                  <Select
                    label="Type"
                    name="type"
                    onChange={setType}
                    enableSearch={true}
                    value={type}
                    isCreatable={true}
                    options={
                      types?.map((t) => ({
                        value: t.value,
                        label: t.value,
                      })) || []
                    }
                  />
                </div>
                <TagInput
                  label="Tags (separated by comma)"
                  tooltipContent="Tags are one word descriptors for the gift card"
                  placeholder={"sprint, summer"}
                  className="w-1/2"
                  values={tags}
                  onChange={(vals) => setTags(vals)}
                />
              </div>
            </DetailsCollapsible>
          </div>
        </BodyCard>
        <BodyCard
          title="Denominations"
          subtitle="Manage your denominations"
          className={"h-auto w-full"}
          actionables={[
            {
              label: "Add denominations",
              onClick: () => console.log("TODO: Should open modal"),
              icon: <PlusIcon />,
            },
          ]}
        >
          <DenominationTable
            giftCardId={giftCard?.id || ""}
            denominations={giftCard?.variants || []}
            defaultCurrency={store?.default_currency_code || ""}
          />
        </BodyCard>
        <BodyCard
          title="Images"
          subtitle="Manage your Gift Card images"
          className={"h-auto w-full"}
        >
          {/* TODO: Add image components */}
        </BodyCard>
      </form>
    </div>
  )
}

export default ManageGiftCard