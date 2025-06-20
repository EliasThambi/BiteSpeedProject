import { Record } from "./types";

export function uniqueEmails(totalRecord: Record) {
  let uniqueEmailList: (string | null)[] = [];

  uniqueEmailList = Array.from(
    new Set(
      totalRecord
        .filter(
          (item) =>
            item.linkedId === totalRecord[0]?.id &&
            item.email !== null &&
            item.linkPrecedence === "secondary"
        )
        .map((item) => item.email)
    )
  );
  if(!uniqueEmailList.some((item)=>item === totalRecord[0].email)){
    uniqueEmailList.unshift(totalRecord[0].email)
  }
  return uniqueEmailList;
}

export function uniquePhoneNumbers(totalRecord: Record) {
  let uniqueNumberList: (number | null)[] = [];

    uniqueNumberList = Array.from(
      new Set(
        totalRecord
          .filter(
            (item) =>
              item.linkedId === totalRecord[0]?.id &&
              item.phoneNumber !== null &&
              item.linkPrecedence === "secondary"
          )
          .map((item) => item.phoneNumber)
      )
    );
    if(!uniqueNumberList.some((item)=>item === totalRecord[0].phoneNumber)){
    uniqueNumberList.unshift(totalRecord[0].phoneNumber)
  }
  
  return uniqueNumberList;
}

export function secondaryContacts(totalRecord: Record) {
  return totalRecord
    .filter((item) => item?.linkedId == totalRecord[0].id)
    .map((item) => item.id);
}
